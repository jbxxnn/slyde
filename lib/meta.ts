import crypto from "crypto";
import { getAppUrl, getEnv } from "@/lib/env";

const DEFAULT_SCOPES = [
  "instagram_basic",
  "instagram_manage_comments",
  "instagram_manage_messages",
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_metadata",
];

export function getMetaApiVersion() {
  return getEnv("META_GRAPH_API_VERSION", "v22.0");
}

export function getMetaRedirectUri() {
  return `${getAppUrl()}/api/meta/oauth/callback`;
}

export function buildMetaLoginUrl(state: string) {
  const appId = process.env.META_APP_ID;

  if (!appId) {
    throw new Error("META_APP_ID is not configured.");
  }

  const url = new URL(`https://www.facebook.com/${getMetaApiVersion()}/dialog/oauth`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", getMetaRedirectUri());
  url.searchParams.set("state", state);
  url.searchParams.set("scope", DEFAULT_SCOPES.join(","));
  url.searchParams.set("response_type", "code");

  return url.toString();
}

export async function exchangeCodeForToken(code: string) {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("META_APP_ID and META_APP_SECRET must be configured.");
  }

  const url = new URL(`https://graph.facebook.com/${getMetaApiVersion()}/oauth/access_token`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("redirect_uri", getMetaRedirectUri());
  url.searchParams.set("code", code);

  const response = await fetch(url);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Failed to exchange Meta code.");
  }

  return payload as { access_token: string; token_type?: string; expires_in?: number };
}

export async function fetchInstagramAccounts(accessToken: string) {
  const url = new URL(`https://graph.facebook.com/${getMetaApiVersion()}/me/accounts`);
  url.searchParams.set("fields", "id,name,access_token,instagram_business_account{id,username,profile_picture_url}");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Failed to fetch connected Instagram accounts.");
  }

  return payload as {
    data?: Array<{
      id: string;
      name: string;
      access_token?: string;
      instagram_business_account?: {
        id: string;
        username?: string;
        profile_picture_url?: string;
      };
    }>;
  };
}

export function verifyMetaSignature(rawBody: string, signature: string | null) {
  const appSecret = process.env.META_APP_SECRET;

  if (!appSecret || !signature) {
    return false;
  }

  const [algorithm, receivedHash] = signature.split("=");
  if (algorithm !== "sha256" || !receivedHash) {
    return false;
  }

  const expectedHash = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(receivedHash), Buffer.from(expectedHash));
}

export async function sendInstagramTextMessage(params: {
  igUserId: string;
  recipientId: string;
  text: string;
  accessToken: string;
}) {
  const response = await fetch(
    `https://graph.facebook.com/${getMetaApiVersion()}/${params.igUserId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: { id: params.recipientId },
        message: { text: params.text },
      }),
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Failed to send Instagram message.");
  }

  return payload;
}

export async function sendInstagramPrivateReply(params: {
  igUserId: string;
  commentId: string;
  text: string;
  accessToken: string;
}) {
  const response = await fetch(
    `https://graph.facebook.com/${getMetaApiVersion()}/${params.igUserId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: { comment_id: params.commentId },
        message: { text: params.text },
      }),
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Failed to send Instagram private reply.");
  }

  return payload;
}
