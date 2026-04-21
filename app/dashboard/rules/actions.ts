"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/dashboard";

export async function createRule(formData: FormData) {
  const context = await getWorkspaceContext();

  if (!context) {
    redirect("/dashboard");
  }

  const triggerType = String(formData.get("trigger_type") ?? "");
  const keyword = String(formData.get("keyword") ?? "").trim();
  const matchType = String(formData.get("match_type") ?? "contains");
  const responseText = String(formData.get("response_text") ?? "").trim();
  const instagramAccountId = String(formData.get("instagram_account_id") ?? "");

  if (!triggerType || !keyword || !responseText || !instagramAccountId) {
    redirect("/dashboard/rules?error=missing-fields");
  }

  const { error } = await context.supabase.from("automation_rules").insert({
    workspace_id: context.workspace.id,
    instagram_account_id: instagramAccountId,
    trigger_type: triggerType,
    keyword,
    match_type: matchType,
    response_text: responseText,
    status: "active",
  });

  if (error) {
    redirect(`/dashboard/rules?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/rules");
  redirect("/dashboard/rules?created=1");
}

export async function updateRuleStatus(formData: FormData) {
  const context = await getWorkspaceContext();

  if (!context) {
    redirect("/dashboard");
  }

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "paused");

  await context.supabase
    .from("automation_rules")
    .update({ status })
    .eq("id", id)
    .eq("workspace_id", context.workspace.id);

  revalidatePath("/dashboard/rules");
}
