import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-file-content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "OPTIONS, PUT",
  "Access-Control-Max-Age": "86400",
};

const CF_ACCOUNT_ID = Deno.env.get("CF_ACCOUNT_ID")!;
const CF_R2_ACCESS_KEY_ID = Deno.env.get("CF_R2_ACCESS_KEY_ID")!;
const CF_R2_SECRET_ACCESS_KEY = Deno.env.get("CF_R2_SECRET_ACCESS_KEY")!;
const CF_R2_BUCKET_NAME = Deno.env.get("CF_R2_BUCKET_NAME")!;
const CF_R2_PUBLIC_URL = Deno.env.get("CF_R2_PUBLIC_URL")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

function toArrayBuffer(view: Uint8Array): ArrayBuffer {
  return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength) as ArrayBuffer;
}

async function hmacSha256(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey("raw", toArrayBuffer(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, toArrayBuffer(data));
  return new Uint8Array(sig);
}

async function sha256(data: Uint8Array): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", toArrayBuffer(data));
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getSigningKey(secretKey: string, dateStamp: string, region: string, service: string) {
  const enc = new TextEncoder();
  let key = await hmacSha256(enc.encode("AWS4" + secretKey), enc.encode(dateStamp));
  key = await hmacSha256(key, enc.encode(region));
  key = await hmacSha256(key, enc.encode(service));
  key = await hmacSha256(key, enc.encode("aws4_request"));
  return key;
}

async function signRequest(method: string, url: string, headers: Record<string, string>, body: Uint8Array) {
  const parsedUrl = new URL(url);
  const now = new Date();
  const dateStamp = now.toISOString().replace(/[-:]/g, "").slice(0, 8);
  const amzDate = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const region = "auto";
  const service = "s3";

  headers["x-amz-date"] = amzDate;
  headers["x-amz-content-sha256"] = await sha256(body);

  const signedHeaderKeys = Object.keys(headers).sort().map((k) => k.toLowerCase());
  const signedHeaders = signedHeaderKeys.join(";");
  const canonicalHeaders = signedHeaderKeys.map((k) => `${k}:${headers[k]}\n`).join("");

  const canonicalRequest = [
    method,
    parsedUrl.pathname,
    parsedUrl.search.slice(1),
    canonicalHeaders,
    signedHeaders,
    headers["x-amz-content-sha256"],
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256(new TextEncoder().encode(canonicalRequest)),
  ].join("\n");

  const signingKey = await getSigningKey(CF_R2_SECRET_ACCESS_KEY, dateStamp, region, service);
  const signature = toHex(await hmacSha256(signingKey, new TextEncoder().encode(stringToSign)));

  headers["Authorization"] = `AWS4-HMAC-SHA256 Credential=${CF_R2_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return headers;
}

function jsonResponse(status: number, body: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function sanitizePath(input: string) {
  const normalized = input.replace(/^\/+/, "");
  if (!normalized || normalized.includes("..") || normalized.includes("\\") || normalized.startsWith(".")) {
    return null;
  }
  return normalized;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "PUT") {
      return jsonResponse(405, { error: "Method not allowed" });
    }

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return jsonResponse(401, { error: "Unauthorized" });
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return jsonResponse(500, { error: "Upload service is not configured correctly." });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse(401, { error: "Unauthorized" });
    }

    const requestedPath = new URL(req.url).searchParams.get("path");
    if (!requestedPath) {
      return jsonResponse(400, { error: "Missing path param" });
    }

    const filePath = sanitizePath(requestedPath);
    if (!filePath) {
      return jsonResponse(400, { error: "Invalid path param" });
    }

    const fileBytes = new Uint8Array(await req.arrayBuffer());
    const r2Url = `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com/${CF_R2_BUCKET_NAME}/${filePath}`;
    const fileContentType = req.headers.get("x-file-content-type") || req.headers.get("content-type") || "application/octet-stream";

    const headers: Record<string, string> = {
      host: `${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      "content-type": fileContentType,
    };

    const signedHeaders = await signRequest("PUT", r2Url, headers, fileBytes);

    const r2Response = await fetch(r2Url, {
      method: "PUT",
      headers: signedHeaders,
      body: fileBytes,
    });

    if (!r2Response.ok) {
      const errorText = await r2Response.text();
      console.error("R2 upload error:", errorText);
      return jsonResponse(500, { error: "Upload failed", details: errorText });
    }

    await r2Response.text();

    return new Response(JSON.stringify({ url: `${CF_R2_PUBLIC_URL}/${filePath}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return jsonResponse(500, { error: err instanceof Error ? err.message : "Unexpected error" });
  }
});
