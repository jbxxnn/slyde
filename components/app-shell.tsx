import Link from "next/link";
import {
  Bot,
  Cable,
  FlaskConical,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MessageSquareText,
} from "lucide-react";
import { signOut } from "@/app/login/actions";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/rules", label: "Rules", icon: ListChecks },
  { href: "/dashboard/inbox", label: "Inbox", icon: MessageSquareText },
  { href: "/dashboard/connect", label: "Instagram", icon: Cable },
  { href: "/dashboard/test", label: "Test", icon: FlaskConical },
];

export function AppShell({
  children,
  workspaceName,
}: {
  children: React.ReactNode;
  workspaceName: string;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-ink/10 bg-white px-4 py-5 lg:block">
        <Link className="flex items-center gap-3 text-xl font-semibold text-ink" href="/dashboard">
          <span className="grid size-9 place-items-center rounded-md bg-moss text-white">
            <Bot size={20} aria-hidden />
          </span>
          RelayKit
        </Link>
        <p className="mt-3 truncate text-sm text-ink/55">{workspaceName}</p>

        <nav className="mt-8 grid gap-1">
          {nav.map((item) => (
            <Link
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-ink/72 hover:bg-mist hover:text-ink"
              href={item.href}
              key={item.href}
            >
              <item.icon size={18} aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>

        <form action={signOut} className="absolute bottom-5 left-4 right-4">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-ink/64 hover:bg-mist">
            <LogOut size={18} aria-hidden />
            Sign out
          </button>
        </form>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-ink/10 bg-paper/92 px-5 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <Link className="text-lg font-semibold" href="/dashboard">
              RelayKit
            </Link>
            <form action={signOut}>
              <button className="rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold">
                Sign out
              </button>
            </form>
          </div>
          <nav className="mt-4 grid grid-cols-4 gap-2">
            {nav.map((item) => (
              <Link
                className="grid place-items-center rounded-md border border-ink/10 bg-white py-2 text-ink/70"
                href={item.href}
                key={item.href}
                title={item.label}
              >
                <item.icon size={18} aria-hidden />
              </Link>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-6 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
