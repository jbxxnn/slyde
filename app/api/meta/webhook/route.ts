import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyMetaSignature } from "@/lib/meta";
import { type AutomationEvent, processAutomationEvent } from "@/lib/automation";

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
  const admin = createAdminClient();

  if (process.env.META_APP_SECRET && !verifyMetaSignature(rawBody, signature)) {
    if (admin) {
      await admin.from("webhook_events").insert({
        provider: "meta",
        event_type: "invalid_signature",
        payload: {
          reason: "x-hub-signature-256 missing or invalid",
          signature_present: Boolean(signature),
          raw_body_preview: rawBody.slice(0, 2000),
        },
      });
    }

    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody);

  if (admin) {
    const linkedAccount = await findLinkedAccountForPayload(payload);

    await admin.from("webhook_events").insert({
      workspace_id: linkedAccount?.workspace_id,
      instagram_account_id: linkedAccount?.id,
      provider: "meta",
      event_type: payload.object ?? "instagram",
      payload,
    });

    const events = extractAutomationEvents(payload);
    await Promise.all(events.map((event) => processAutomationEvent(event)));
  }

  return NextResponse.json({ received: true });
}

async function findLinkedAccountForPayload(payload: any) {
  const admin = createAdminClient();

  if (!admin) {
    return null;
  }

  const entryIds = (payload.entry ?? [])
    .map((entry: any) => String(entry.id ?? ""))
    .filter(Boolean);

  if (entryIds.length) {
    const { data: account } = await admin
      .from("instagram_accounts")
      .select("id, workspace_id, ig_user_id")
      .in("ig_user_id", entryIds)
      .limit(1)
      .maybeSingle();

    if (account) {
      return account;
    }
  }

  const { data: fallbackAccount } = await admin
    .from("instagram_accounts")
    .select("id, workspace_id, ig_user_id")
    .eq("status", "connected")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return fallbackAccount ?? null;
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
