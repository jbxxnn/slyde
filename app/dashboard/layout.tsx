import { AppShell } from "@/components/app-shell";
import { SetupNotice } from "@/components/setup-notice";
import { getWorkspaceContext } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const context = await getWorkspaceContext();

  if (!context) {
    return <SetupNotice />;
  }

  return <AppShell workspaceName={context.workspace.name}>{children}</AppShell>;
}
