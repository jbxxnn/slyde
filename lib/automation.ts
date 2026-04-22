import { createAdminClient } from "@/lib/supabase/admin";
import { sendInstagramPrivateReply, sendInstagramTextMessage } from "@/lib/meta";

export type AutomationEvent =
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

export async function processAutomationEvent(event: AutomationEvent) {
  const admin = createAdminClient();

  if (!admin) {
    return { status: "skipped", reason: "admin-client-missing" };
  }

  const { data: account } = await admin
    .from("instagram_accounts")
    .select("id, workspace_id, ig_user_id")
    .eq("ig_user_id", event.igUserId)
    .eq("status", "connected")
    .maybeSingle();

  if (!account) {
    return { status: "skipped", reason: "account-not-found" };
  }

  const { data: token } = await admin
    .from("instagram_account_tokens")
    .select("access_token")
    .eq("instagram_account_id", account.id)
    .maybeSingle();

  if (!token?.access_token) {
    return { status: "skipped", reason: "token-not-found" };
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

  return { status: "processed", matchedRules: matchedRules.length };
}

function keywordMatches(input: string, keyword: string, matchType: string) {
  const normalizedInput = input.trim().toLowerCase();
  const normalizedKeyword = keyword.trim().toLowerCase();

  if (matchType === "exact") {
    return normalizedInput === normalizedKeyword;
  }

  return normalizedInput.includes(normalizedKeyword);
}
