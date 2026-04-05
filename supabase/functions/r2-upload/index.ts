// supabase/functions/r2-upload/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-file-content-type",
  "Access-Control-Allow-Methods": "OPTIONS, PUT",
  "Access-Control-Max-Age": "86400",
};

const CF_ACCOUNT_ID = Deno.env.get("CF_ACCOUNT_ID")!;
const CF_R2_ACCESS_KEY_ID = Deno.env.get("CF_R2_ACCESS_KEY_ID")!;
const CF_R2_SECRET_ACCESS_KEY = Deno.env.get("CF_R2_SECRET_ACCESS_KEY")!;
const CF_R2_BUCKET_NAME = Deno.env.get("CF_R2_BUCKET_NAME")!;
const CF_R2_PUBLIC_URL = Deno.env.get("CF_R2_PUBLIC_URL")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Simple S3-compatible signing (fixed)
async function signRequest(
  method: string, 
  url: string, 
  headers: Record<string, string>, 
  body: Uint8Array
) {
  const parsedUrl = new URL(url);
  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, "");
  const amzDate = now.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const region = "auto";
  const service = "s3";

  // Required headers
  headers["x-amz-date"] = amzDate;
  headers["host"] = parsedUrl.host;
  
  // CRITICAL: Content-Length is required for PUT
  headers["content-length"] = body.length.toString();
  
  // Calculate SHA256 of body
  const bodyHash = await crypto.subtle.digest("SHA-256", body.buffer as ArrayBuffer);
  const bodyHashHex = Array.from(new Uint8Array(bodyHash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  headers["x-amz-content-sha256"] = bodyHashHex;

  // Create canonical request
  const signedHeaders = Object.keys(headers)
    .map(k => k.toLowerCase())
    .sort()
    .join(";");
  
  const canonicalHeaders = Object.keys(headers)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map(k => `${k.toLowerCase()}:${headers[k]}\n`)
    .join("");

  const canonicalRequest = [
    method,
    parsedUrl.pathname,
    parsedUrl.search.slice(1),
    canonicalHeaders,
    signedHeaders,
    bodyHashHex,
  ].join("\n");

  // Create string to sign
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const canonicalRequestHash = await crypto.subtle.digest(
    "SHA-256", 
    new TextEncoder().encode(canonicalRequest)
  );
  const canonicalRequestHashHex = Array.from(new Uint8Array(canonicalRequestHash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    canonicalRequestHashHex,
  ].join("\n");

  // Calculate signature
  const getSignatureKey = async (key: string, dateStamp: string, region: string, service: string) => {
    const kDate = await hmacSha256(new TextEncoder().encode("AWS4" + key), new TextEncoder().encode(dateStamp));
    const kRegion = await hmacSha256(kDate, new TextEncoder().encode(region));
    const kService = await hmacSha256(kRegion, new TextEncoder().encode(service));
    const kSigning = await hmacSha256(kService, new TextEncoder().encode("aws4_request"));
    return kSigning;
  };

  const signingKey = await getSignatureKey(CF_R2_SECRET_ACCESS_KEY, dateStamp, region, service);
  const signature = await hmacSha256(signingKey, new TextEncoder().encode(stringToSign));
  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  headers["Authorization"] = 
    `AWS4-HMAC-SHA256 Credential=${CF_R2_ACCESS_KEY_ID}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, ` +
    `Signature=${signatureHex}`;

  return headers;
}

async function hmacSha256(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw", 
    key.buffer as ArrayBuffer, 
    { name: "HMAC", hash: "SHA-256" }, 
    false, 
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, data.buffer as ArrayBuffer);
  return new Uint8Array(signature);
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function sanitizePath(input: string): string | null {
  const normalized = input.replace(/^\/+/, "");
  if (!normalized || normalized.includes("..") || normalized.includes("\\") || normalized.startsWith(".")) {
    return null;
  }
  return normalized;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "PUT") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return jsonResponse(401, { error: "Missing authorization" });
    }

    // Validate env vars
    if (!CF_ACCOUNT_ID || !CF_R2_ACCESS_KEY_ID || !CF_R2_SECRET_ACCESS_KEY || 
        !CF_R2_BUCKET_NAME || !CF_R2_PUBLIC_URL || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing environment variables");
      return jsonResponse(500, { error: "Server configuration error" });
    }

    // Verify user with Supabase
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
      },
    });

    if (!authRes.ok) {
      return jsonResponse(401, { error: "Invalid token" });
    }

    const { id: userId } = await authRes.json();
    if (!userId) {
      return jsonResponse(401, { error: "Unauthorized" });
    }

    // Get and validate path
    const requestedPath = new URL(req.url).searchParams.get("path");
    if (!requestedPath) {
      return jsonResponse(400, { error: "Missing path parameter" });
    }

    const filePath = sanitizePath(requestedPath);
    if (!filePath) {
      return jsonResponse(400, { error: "Invalid path" });
    }

    // Get file data
    const fileBytes = new Uint8Array(await req.arrayBuffer());
    
    // CRITICAL: Check for empty body
    if (fileBytes.length === 0) {
      return jsonResponse(400, { error: "Empty file" });
    }

    console.log("Uploading:", filePath, "Size:", fileBytes.length, "User:", userId);

    // Prepare R2 request
    const r2Url = `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com/${CF_R2_BUCKET_NAME}/${filePath}`;
    const contentType = req.headers.get("x-file-content-type") || "application/octet-stream";

    const headers: Record<string, string> = {
      "content-type": contentType,
    };

    // Sign request (now includes Content-Length)
    const signedHeaders = await signRequest("PUT", r2Url, headers, fileBytes);

    // Upload to R2 with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const r2Response = await fetch(r2Url, {
      method: "PUT",
      headers: signedHeaders,
      body: fileBytes,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!r2Response.ok) {
      const errorText = await r2Response.text();
      console.error("R2 error:", r2Response.status, errorText);
      return jsonResponse(500, { 
        error: "Storage upload failed", 
        details: `R2 returned ${r2Response.status}` 
      });
    }

    // Success
    const publicUrl = `${CF_R2_PUBLIC_URL}/${filePath}`;
    console.log("Success:", publicUrl);

    return jsonResponse(200, { url: publicUrl });

  } catch (err) {
    console.error("Error:", err);
    
    if (err instanceof Error && err.name === "AbortError") {
      return jsonResponse(504, { error: "Upload timeout" });
    }
    
    return jsonResponse(500, { 
      error: err instanceof Error ? err.message : "Upload failed" 
    });
  }
});
