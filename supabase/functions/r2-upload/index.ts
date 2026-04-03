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

async function hmacSha256(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, data);
  return new Uint8Array(sig);
}

async function sha256(data: Uint8Array): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", data);
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    // Direct upload: receive file as binary
    if (req.method === "PUT") {
      const filePath = new URL(req.url).searchParams.get("path");
      if (!filePath) {
        return new Response(JSON.stringify({ error: "Missing path param" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const fileBytes = new Uint8Array(await req.arrayBuffer());
      const r2Url = `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com/${CF_R2_BUCKET_NAME}/${filePath}`;

      const fileContentType = req.headers.get("x-file-content-type") || "application/octet-stream";

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
        return new Response(JSON.stringify({ error: "Upload failed", details: errorText }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await r2Response.text();

      const publicUrl = `${CF_R2_PUBLIC_URL}/${filePath}`;

      return new Response(JSON.stringify({ url: publicUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
