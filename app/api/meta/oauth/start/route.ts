import crypto from "crypto";
import { NextResponse } from "next/server";
import { buildMetaLoginUrl } from "@/lib/meta";
import { getWorkspaceContext } from "@/lib/dashboard";

export async function GET() {
  const context = await getWorkspaceContext();

  if (!context) {
    return NextResponse.redirect("/dashboard/connect?error=supabase-not-configured");
  }

  const state = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error } = await context.supabase.from("oauth_states").insert({
    workspace_id: context.workspace.id,
    user_id: context.user.id,
    provider: "meta",
    state,
    expires_at: expiresAt,
  });

  if (error) {
    return NextResponse.redirect(`/dashboard/connect?error=${encodeURIComponent(error.message)}`);
  }

  try {
    return NextResponse.redirect(buildMetaLoginUrl(state));
  } catch (error) {
    return NextResponse.redirect(
      `/dashboard/connect?error=${encodeURIComponent((error as Error).message)}`,
    );
  }
}
