import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/env";
import {
  exchangeCodeForToken,
  exchangeForLongLivedInstagramToken,
  fetchInstagramAccount,
} from "@/lib/meta";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${getAppUrl()}/dashboard/connect?error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${getAppUrl()}/dashboard/connect?error=missing-meta-code`);
  }

  const supabase = await createClient();
  const admin = createAdminClient();

  if (!admin) {
    return NextResponse.redirect(`${getAppUrl()}/dashboard/connect?error=service-role-missing`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${getAppUrl()}/login`);
  }

  const { data: oauthState } = await supabase
    .from("oauth_states")
    .select("id, workspace_id, expires_at")
    .eq("state", state)
    .eq("provider", "meta")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!oauthState || new Date(oauthState.expires_at).getTime() < Date.now()) {
    return NextResponse.redirect(`${getAppUrl()}/dashboard/connect?error=invalid-oauth-state`);
  }

  try {
    const shortLivedToken = await exchangeCodeForToken(code);
    let accessToken = shortLivedToken.access_token;
    let tokenType = shortLivedToken.token_type ?? "bearer";
    let expiresIn = shortLivedToken.expires_in;

    try {
      const longLivedToken = await exchangeForLongLivedInstagramToken(shortLivedToken.access_token);
      accessToken = longLivedToken.access_token;
      tokenType = longLivedToken.token_type ?? tokenType;
      expiresIn = longLivedToken.expires_in ?? expiresIn;
    } catch {
      // Keep the short-lived token during setup so we can verify OAuth/account linking first.
    }

    const instagram = await fetchInstagramAccount(accessToken);
    const igUserId = instagram.user_id ?? instagram.id;

    const { data: savedAccount, error: accountError } = await admin
      .from("instagram_accounts")
      .upsert(
        {
          workspace_id: oauthState.workspace_id,
          ig_user_id: igUserId,
          username: instagram.username,
          page_id: null,
          page_name: instagram.account_type ?? "Instagram professional account",
          status: "connected",
        },
        { onConflict: "workspace_id,ig_user_id" },
      )
      .select("id")
      .single();

    if (accountError || !savedAccount) {
      throw new Error(accountError?.message ?? "Could not save Instagram account.");
    }

    await admin.from("instagram_account_tokens").upsert(
      {
        instagram_account_id: savedAccount.id,
        access_token: accessToken,
        token_type: tokenType,
        expires_at: expiresIn
          ? new Date(Date.now() + expiresIn * 1000).toISOString()
          : null,
      },
      { onConflict: "instagram_account_id" },
    );

    await supabase.from("oauth_states").delete().eq("id", oauthState.id);

    return NextResponse.redirect(`${getAppUrl()}/dashboard/connect?connected=1`);
  } catch (caught) {
    return NextResponse.redirect(
      `${getAppUrl()}/dashboard/connect?error=${encodeURIComponent((caught as Error).message)}`,
    );
  }
}
