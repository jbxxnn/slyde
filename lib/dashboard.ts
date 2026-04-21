import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type WorkspaceContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: {
    id: string;
    email?: string;
  };
  workspace: {
    id: string;
    name: string;
  };
};

export async function getWorkspaceContext(): Promise<WorkspaceContext | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(id, name)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const existingWorkspace = Array.isArray(membership?.workspaces)
    ? membership?.workspaces[0]
    : membership?.workspaces;

  if (existingWorkspace?.id) {
    return {
      supabase,
      user: { id: user.id, email: user.email },
      workspace: {
        id: existingWorkspace.id,
        name: existingWorkspace.name,
      },
    };
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({
      created_by: user.id,
      name: user.email ? `${user.email.split("@")[0]}'s workspace` : "Founder workspace",
    })
    .select("id, name")
    .single();

  if (workspaceError || !workspace) {
    throw new Error(workspaceError?.message ?? "Unable to create workspace.");
  }

  const { error: memberError } = await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) {
    throw new Error(memberError.message);
  }

  return {
    supabase,
    user: { id: user.id, email: user.email },
    workspace,
  };
}
