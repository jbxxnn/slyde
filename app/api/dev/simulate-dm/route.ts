import { NextResponse } from "next/server";
import { getWorkspaceContext } from "@/lib/dashboard";
import { processAutomationEvent } from "@/lib/automation";

export async function POST() {
  const context = await getWorkspaceContext();

  if (!context) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 400 });
  }

  const { data: account } = await context.supabase
    .from("instagram_accounts")
    .select("ig_user_id")
    .eq("workspace_id", context.workspace.id)
    .eq("status", "connected")
    .limit(1)
    .maybeSingle();

  if (!account) {
    return NextResponse.json({ error: "No connected Instagram account." }, { status: 400 });
  }

  const result = await processAutomationEvent({
    triggerType: "dm_keyword",
    igUserId: account.ig_user_id,
    senderId: "relaykit_test_sender",
    text: "guide",
    raw: {
      source: "relaykit-dev-simulation",
      text: "guide",
    },
  });

  return NextResponse.json(result);
}
