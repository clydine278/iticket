import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UploadOptions {
  folder?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

interface UploadResult {
  url: string;
  error?: string;
  details?: string;
}

type UploadPhase = "preparing" | "uploading" | "processing" | "complete" | "error";

interface UploadState {
  progress: number;
  phase: UploadPhase;
  uploading: boolean;
  error: string | null;
}

function uploadWithXhr({
  url,
  file,
  headers,
  onProgress,
}: {
  url: string;
  file: File;
  headers: Record<string, string>;
  onProgress: (progress: number, phase: UploadPhase) => void;
}) {
  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Longer timeout for large files
    xhr.timeout = 600000; // 10 minutes

    // Debug logging
    const debug = (msg: string, data?: unknown) => {
      console.log(`[R2Upload] ${msg}`, data || "");
    };

    debug("Initializing upload", { url, fileName: file.name, size: file.size });

    try {
      xhr.open("PUT", url);
      debug("XHR opened");
    } catch (e) {
      debug("Failed to open XHR", e);
      reject(new Error("Failed to initialize upload connection"));
      return;
    }

    // Set headers
    Object.entries(headers).forEach(([key, value]) => {
      if (value) {
        try {
          xhr.setRequestHeader(key, value);
          debug(`Header set: ${key}`);
        } catch (e) {
          debug(`Failed to set header ${key}`, e);
        }
      }
    });

    let uploadComplete = false;
    let lastProgressTime = Date.now();

    // Progress tracking
    xhr.upload.onprogress = (event) => {
      lastProgressTime = Date.now();
      
      if (!event.lengthComputable || event.total <= 0) {
        onProgress(10, "uploading");
        return;
      }
      
      const percent = (event.loaded / event.total) * 100;
      const scaled = Math.round(percent * 0.85); // 0-85% for upload
      const clamped = Math.min(85, Math.max(5, scaled));
      
      onProgress(clamped, "uploading");
    };

    xhr.upload.onload = () => {
      debug("Upload data sent successfully");
      uploadComplete = true;
      onProgress(90, "processing");
    };

    xhr.upload.onerror = () => {
      debug("Upload stream error");
    };

    // Response tracking
    xhr.onprogress = () => {
      if (uploadComplete) {
        onProgress(95, "processing");
      }
    };

    // Error handlers with detailed diagnostics
    xhr.onerror = () => {
      const now = Date.now();
      const timeSinceProgress = now - lastProgressTime;
      
      debug("Network error details", {
        status: xhr.status,
        statusText: xhr.statusText,
        responseText: xhr.responseText?.substring(0, 200),
        timeSinceProgress,
        readyState: xhr.readyState,
      });

      onProgress(0, "error");
      
      // Provide specific error messages based on context
      let errorMsg = "Network error during upload";
      
      if (timeSinceProgress > 300000) {
        errorMsg = "Upload stalled for 5+ minutes. Connection may be unstable or server is not responding.";
      } else if (xhr.status === 0) {
        errorMsg = "Connection blocked. This may be caused by: CORS policy, ad blocker, firewall, or the Edge Function failing to respond. Check browser console and Edge Function logs.";
      } else if (xhr.status >= 500) {
        errorMsg = `Server error (${xhr.status}). The Edge Function may have crashed or timed out.`;
      }
      
      reject(new Error(errorMsg));
    };

    xhr.ontimeout = () => {
      debug("Timeout reached");
      onProgress(0, "error");
      reject(new Error("Upload timed out after 10 minutes. File may be too large or connection is too slow."));
    };

    xhr.onabort = () => {
      debug("Upload aborted");
      onProgress(0, "error");
      reject(new Error("Upload was cancelled"));
    };

    // Success handler
    xhr.onload = () => {
      debug("Response received", { status: xhr.status, responseLength: xhr.responseText?.length });

      onProgress(98, "processing");

      let payload: UploadResult | null = null;
      
      try {
        if (xhr.responseText && xhr.responseText.trim()) {
          payload = JSON.parse(xhr.responseText);
        }
      } catch (e) {
        debug("JSON parse error", e);
      }

      // Success range
      if (xhr.status >= 200 && xhr.status < 300) {
        if (!payload?.url) {
          debug("Warning: No URL in response", payload);
        }
        
        onProgress(100, "complete");
        resolve({ 
          url: payload?.url || "",
          error: payload?.error,
          details: payload?.details,
        });
        return;
      }

      // Error handling by status
      onProgress(0, "error");
      
      let errorMsg = payload?.error || payload?.details || `Upload failed (${xhr.status})`;
      
      if (xhr.status === 401) {
        errorMsg = "Authentication failed. Please sign in again.";
      } else if (xhr.status === 403) {
        errorMsg = "Access denied. You may not have permission to upload.";
      } else if (xhr.status === 413) {
        errorMsg = "File too large for server limits.";
      } else if (xhr.status === 429) {
        errorMsg = "Rate limited. Please wait a moment and try again.";
      } else if (xhr.status >= 500) {
        errorMsg = `Server error (${xhr.status}). Please check Edge Function logs in Supabase Dashboard.`;
      }
      
      reject(new Error(errorMsg));
    };

    // Send with error catch
    try {
      xhr.send(file);
      debug("File sent to XHR");
    } catch (e) {
      debug("Failed to send file", e);
      reject(new Error("Failed to start file upload"));
    }
  });
}

export function useR2Upload() {
  const [state, setState] = useState<UploadState>({
    progress: 0,
    phase: "preparing",
    uploading: false,
    error: null,
  });

  const setProgress = useCallback((progress: number, phase: UploadPhase) => {
    setState(prev => ({
      ...prev,
      progress,
      phase,
      uploading: phase !== "complete" && phase !== "error",
      error: phase === "error" ? prev.error : null,
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      error,
      uploading: false,
      phase: "error",
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      progress: 0,
      phase: "preparing",
      uploading: false,
      error: null,
    });
  }, []);

  const upload = useCallback(async (
    file: File, 
    options: UploadOptions = {}
  ): Promise<string> => {
    const { 
      folder = "uploads", 
      maxSizeMB = 10, 
      acceptedTypes 
    } = options;

    reset();

    // Validation
    if (!file || file.size === 0) {
      setError("No file selected or file is empty");
      throw new Error("No file selected or file is empty");
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
    }

    if (acceptedTypes && !acceptedTypes.some((type) => file.type.startsWith(type))) {
      setError(`File type ${file.type} not accepted`);
      throw new Error(`File type ${file.type} not accepted`);
    }

    setProgress(0, "preparing");

    try {
      // Generate filename
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "bin";
      const fileName = `${folder}/${crypto.randomUUID()}.${safeExt}`;

      console.log("[R2Upload] Generated filename:", fileName);

      // Get session with retry
      let token: string | null = null;
      let sessionRetries = 2;
      
      while (sessionRetries > 0) {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (!sessionError && sessionData?.session?.access_token) {
          token = sessionData.session.access_token;
          break;
        }
        
        sessionRetries--;
        if (sessionRetries > 0) {
          console.log("[R2Upload] Retrying session fetch...");
          await new Promise(r => setTimeout(r, 500));
        }
      }

      if (!token) {
        throw new Error("Authentication required. Please sign in again.");
      }

      setProgress(5, "preparing");

      // Environment check
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      if (!projectId) {
        throw new Error("Missing VITE_SUPABASE_PROJECT_ID. Check your .env file.");
      }

      // Validate project ID format
      if (!/^[a-z0-9-]+$/.test(projectId)) {
        throw new Error("Invalid VITE_SUPABASE_PROJECT_ID format");
      }

      const url = `https://${projectId}.supabase.co/functions/v1/r2-upload?path=${encodeURIComponent(fileName)}`;
      
      console.log("[R2Upload] Upload URL:", url.replace(token.substring(0, 20), "..."));

      setProgress(10, "uploading");

      const result = await uploadWithXhr({
        url,
        file,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-file-content-type": file.type || "application/octet-stream",
          "x-file-size": file.size.toString(),
          "x-file-name": encodeURIComponent(file.name),
        },
        onProgress: setProgress,
      });

      // Validate result
      if (!result.url && !result.error) {
        throw new Error("Upload completed but no URL returned. Check Edge Function response.");
      }

      if (result.error) {
        throw new Error(result.error);
      }

      // Success delay for UX
      await new Promise((resolve) => setTimeout(resolve, 400));
      
      console.log("[R2Upload] Success:", result.url);
      return result.url;
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown upload error";
      console.error("[R2Upload] Failed:", message);
      setError(message);
      throw error;
    } finally {
      // Auto-reset after completion/error
      setTimeout(() => {
        setState(prev => {
          if (prev.phase === "complete" || prev.phase === "error") {
            return {
              progress: 0,
              phase: "preparing",
              uploading: false,
              error: null,
            };
          }
          return prev;
        });
      }, state.phase === "complete" ? 3000 : 5000);
    }
  }, [setProgress, setError, reset, state.phase]);

  return { 
    upload, 
    uploading: state.uploading, 
    progress: state.progress,
    phase: state.phase,
    error: state.error,
    reset,
  };
}
