import crypto from "crypto";
import { getAppUrl, getEnv } from "@/lib/env";

const DEFAULT_SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_comments",
  "instagram_business_manage_messages",
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

  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", getMetaRedirectUri());
  url.searchParams.set("state", state);
  url.searchParams.set("scope", DEFAULT_SCOPES.join(","));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("enable_fb_login", "0");
  url.searchParams.set("force_authentication", "1");

  return url.toString();
}

export async function exchangeCodeForToken(code: string) {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("META_APP_ID and META_APP_SECRET must be configured.");
  }

  const body = new URLSearchParams();
  body.set("client_id", appId);
  body.set("client_secret", appSecret);
  body.set("grant_type", "authorization_code");
  body.set("redirect_uri", getMetaRedirectUri());
  body.set("code", code);

  const response = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(formatMetaError(payload, "Failed to exchange Instagram code."));
  }

  return payload as {
    access_token: string;
    user_id?: string | number;
    permissions?: string[];
    token_type?: string;
    expires_in?: number;
  };
}

export async function exchangeForLongLivedInstagramToken(accessToken: string) {
  const appSecret = process.env.META_APP_SECRET;

  if (!appSecret) {
    throw new Error("META_APP_SECRET must be configured.");
  }

  const url = new URL("https://graph.instagram.com/access_token");
  url.searchParams.set("grant_type", "ig_exchange_token");
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(formatMetaError(payload, "Failed to exchange Instagram token."));
  }

  return payload as {
    access_token: string;
    token_type?: string;
    expires_in?: number;
  };
}

export async function fetchInstagramAccount(accessToken: string) {
  const url = new URL(`https://graph.instagram.com/${getMetaApiVersion()}/me`);
  url.searchParams.set("fields", "id,user_id,username,profile_picture_url,account_type");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(formatMetaError(payload, "Failed to fetch connected Instagram account."));
  }

  return payload as {
    id: string;
    user_id?: string;
    username?: string;
    profile_picture_url?: string;
    account_type?: string;
  };
}

export async function fetchInstagramMedia(params: { igUserId: string; accessToken: string }) {
  const url = new URL(`https://graph.instagram.com/${getMetaApiVersion()}/${params.igUserId}/media`);
  url.searchParams.set("fields", "id,caption,comments_count,media_type,permalink,timestamp");
  url.searchParams.set("access_token", params.accessToken);

  const response = await fetch(url, { cache: "no-store" });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(formatMetaError(payload, "Failed to fetch Instagram media."));
  }

  return payload as {
    data?: Array<{
      id: string;
      caption?: string;
      comments_count?: number;
      media_type?: string;
      permalink?: string;
      timestamp?: string;
    }>;
  };
}

export async function fetchInstagramComments(params: { mediaId: string; accessToken: string }) {
  const url = new URL(`https://graph.instagram.com/${getMetaApiVersion()}/${params.mediaId}/comments`);
  url.searchParams.set("fields", "id,text,username,timestamp");
  url.searchParams.set("access_token", params.accessToken);

  const response = await fetch(url, { cache: "no-store" });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(formatMetaError(payload, "Failed to fetch Instagram comments."));
  }

  return payload as {
    data?: Array<{
      id: string;
      text?: string;
      username?: string;
      timestamp?: string;
    }>;
  };
}

export async function fetchInstagramCommentTest(params: { igUserId: string; accessToken: string }) {
  const media = await fetchInstagramMedia(params);
  const firstMedia = media.data?.[0];

  if (!firstMedia) {
    return {
      status: "no_media",
      media,
      message: "Connected Instagram account has no media returned by the API.",
    };
  }

  const comments = await fetchInstagramComments({
    mediaId: firstMedia.id,
    accessToken: params.accessToken,
  });

  return {
    status: "ok",
    media: firstMedia,
    comments,
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
    `https://graph.instagram.com/${getMetaApiVersion()}/${params.igUserId}/messages`,
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
    throw new Error(formatMetaError(payload, "Failed to send Instagram message."));
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
    `https://graph.instagram.com/${getMetaApiVersion()}/${params.igUserId}/messages`,
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
    throw new Error(formatMetaError(payload, "Failed to send Instagram private reply."));
  }

  return payload;
}

function formatMetaError(payload: any, fallback: string) {
  const error = payload?.error;

  if (!error) {
    return fallback;
  }

  return [
    error.message ?? fallback,
    error.type ? `type=${error.type}` : null,
    error.code ? `code=${error.code}` : null,
    error.error_subcode ? `subcode=${error.error_subcode}` : null,
    error.fbtrace_id ? `trace=${error.fbtrace_id}` : null,
  ]
    .filter(Boolean)
    .join(" | ");
}
