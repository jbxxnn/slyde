"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAppUrl } from "@/lib/env";

export async function runDmSimulation() {
  const response = await fetch(`${getAppUrl()}/api/dev/simulate-dm`, {
    method: "POST",
    cache: "no-store",
  });

  const payload = await response.json();

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/inbox");
  redirect(`/dashboard/test?result=${encodeURIComponent(JSON.stringify(payload))}`);
}
