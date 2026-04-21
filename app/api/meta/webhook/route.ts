import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendInstagramPrivateReply,
  sendInstagramTextMessage,
  verifyMetaSignature,
} from "@/lib/meta";

type AutomationEvent =
  | {
      triggerType: "dm_keyword";
      igUserId: string;
      senderId: string;
      text: string;
      raw: unknown;
    }
  | {
      triggerType: "comment_keyword";
      igUserId: string;
      commentId: string;
      senderId?: string;
      text: string;
      raw: unknown;
    };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (process.env.META_APP_SECRET && !verifyMetaSignature(rawBody, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const admin = createAdminClient();
  const payload = JSON.parse(rawBody);

  if (admin) {
    await admin.from("webhook_events").insert({
      provider: "meta",
      event_type: payload.object ?? "instagram",
      payload,
    });

    const events = extractAutomationEvents(payload);
    await Promise.all(events.map((event) => processAutomationEvent(event)));
  }

  return NextResponse.json({ received: true });
}

function extractAutomationEvents(payload: any): AutomationEvent[] {
  const events: AutomationEvent[] = [];

  for (const entry of payload.entry ?? []) {
    const igUserId = String(entry.id ?? "");

    for (const messageEvent of entry.messaging ?? []) {
      const text = messageEvent.message?.text;
      const senderId = messageEvent.sender?.id;

      if (igUserId && text && senderId) {
        events.push({
          triggerType: "dm_keyword",
          igUserId,
          senderId,
          text,
          raw: messageEvent,
        });
      }
    }

    for (const change of entry.changes ?? []) {
      const value = change.value ?? {};
      const text = value.text;
      const commentId = value.id ?? value.comment_id;

      if (change.field === "comments" && igUserId && text && commentId) {
        events.push({
          triggerType: "comment_keyword",
          igUserId,
          commentId,
          senderId: value.from?.id,
          text,
          raw: change,
        });
      }
    }
  }

  return events;
}

async function processAutomationEvent(event: AutomationEvent) {
  const admin = createAdminClient();

  if (!admin) {
    return;
  }

  const { data: account } = await admin
    .from("instagram_accounts")
    .select("id, workspace_id, ig_user_id")
    .eq("ig_user_id", event.igUserId)
    .eq("status", "connected")
    .maybeSingle();

  if (!account) {
    return;
  }

  const { data: token } = await admin
    .from("instagram_account_tokens")
    .select("access_token")
    .eq("instagram_account_id", account.id)
    .maybeSingle();

  if (!token?.access_token) {
    return;
  }

  await admin.from("webhook_events").insert({
    workspace_id: account.workspace_id,
    instagram_account_id: account.id,
    provider: "meta",
    event_type: event.triggerType,
    payload: event.raw,
  });

  const { data: rules } = await admin
    .from("automation_rules")
    .select("id, keyword, match_type, response_text")
    .eq("workspace_id", account.workspace_id)
    .eq("instagram_account_id", account.id)
    .eq("trigger_type", event.triggerType)
    .eq("status", "active");

  const matchedRules = (rules ?? []).filter((rule) =>
    keywordMatches(event.text, rule.keyword, rule.match_type),
  );

  for (const rule of matchedRules) {
    const { data: run } = await admin
      .from("automation_runs")
      .insert({
        workspace_id: account.workspace_id,
        instagram_account_id: account.id,
        automation_rule_id: rule.id,
        trigger_type: event.triggerType,
        status: "running",
        input_text: event.text,
        payload: event.raw,
      })
      .select("id")
      .single();

    try {
      if (event.triggerType === "dm_keyword") {
        await sendInstagramTextMessage({
          igUserId: account.ig_user_id,
          recipientId: event.senderId,
          text: rule.response_text,
          accessToken: token.access_token,
        });
      } else {
        await sendInstagramPrivateReply({
          igUserId: account.ig_user_id,
          commentId: event.commentId,
          text: rule.response_text,
          accessToken: token.access_token,
        });
      }

      if (run?.id) {
        await admin.from("automation_runs").update({ status: "succeeded" }).eq("id", run.id);
      }
    } catch (caught) {
      if (run?.id) {
        await admin
          .from("automation_runs")
          .update({ status: "failed", error_message: (caught as Error).message })
          .eq("id", run.id);
      }
    }
  }
}

function keywordMatches(input: string, keyword: string, matchType: string) {
  const normalizedInput = input.trim().toLowerCase();
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (matchType === "exact") {
    return normalizedInput === normalizedKeyword;
  }

  return normalizedInput.includes(normalizedKeyword);
}
