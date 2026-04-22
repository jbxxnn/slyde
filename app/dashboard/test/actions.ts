"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/dashboard";
import { processAutomationEvent } from "@/lib/automation";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchInstagramCommentTest } from "@/lib/meta";

export async function runDmSimulation() {
  let payload: unknown;

  try {
    const context = await getWorkspaceContext();

    if (!context) {
      payload = { error: "Supabase is not configured." };
    } else {
      const { data: account, error } = await context.supabase
        .from("instagram_accounts")
        .select("ig_user_id")
        .eq("workspace_id", context.workspace.id)
        .eq("status", "connected")
        .limit(1)
        .maybeSingle();

      if (error) {
        payload = { error: error.message };
      } else if (!account) {
        payload = { error: "No connected Instagram account." };
      } else {
        payload = await processAutomationEvent({
          triggerType: "dm_keyword",
          igUserId: account.ig_user_id,
          senderId: "relaykit_test_sender",
          text: "guide",
          raw: {
            source: "relaykit-dev-simulation",
            text: "guide",
          },
        });
      }
    }
  } catch (caught) {
    payload = { error: (caught as Error).message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/inbox");
  redirect(`/dashboard/test?result=${encodeURIComponent(JSON.stringify(payload))}`);
}

export async function runCommentApiTest() {
  let payload: unknown;

  try {
    const context = await getWorkspaceContext();
    const admin = createAdminClient();

    if (!context) {
      payload = { error: "Supabase is not configured." };
    } else if (!admin) {
      payload = { error: "Admin client is not configured." };
    } else {
      const { data: account, error } = await context.supabase
        .from("instagram_accounts")
        .select("id, ig_user_id, username")
        .eq("workspace_id", context.workspace.id)
        .eq("status", "connected")
        .limit(1)
        .maybeSingle();

      if (error) {
        payload = { error: error.message };
      } else if (!account) {
        payload = { error: "No connected Instagram account." };
      } else {
        const { data: token, error: tokenError } = await admin
          .from("instagram_account_tokens")
          .select("access_token")
          .eq("instagram_account_id", account.id)
          .maybeSingle();

        if (tokenError) {
          payload = { error: tokenError.message };
        } else if (!token?.access_token) {
          payload = { error: "No token found for connected Instagram account." };
        } else {
          const result = await fetchInstagramCommentTest({
            igUserId: account.ig_user_id,
            accessToken: token.access_token,
          });

          payload = {
            account: {
              username: account.username,
              ig_user_id: account.ig_user_id,
            },
            result,
          };
        }
      }
    }
  } catch (caught) {
    payload = { error: (caught as Error).message };
  }

  redirect(`/dashboard/test?result=${encodeURIComponent(JSON.stringify(payload))}`);
}
