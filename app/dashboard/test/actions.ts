"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/dashboard";
import { processAutomationEvent } from "@/lib/automation";

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
