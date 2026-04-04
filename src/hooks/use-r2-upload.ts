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

    // Set timeout to prevent hanging indefinitely (5 minutes max)
    xhr.timeout = 300000;

    xhr.open("PUT", url);

    Object.entries(headers).forEach(([key, value]) => {
      if (value) xhr.setRequestHeader(key, value);
    });

    // Track if we've started processing phase
    let uploadComplete = false;

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) {
        onProgress(10, "uploading");
        return;
      }
      
      // Calculate actual upload progress (0-90% range)
      const rawProgress = event.loaded / event.total;
      const scaledProgress = Math.round(rawProgress * 90);
      
      // Ensure we don't hit 90% until actually done
      const safeProgress = Math.min(89, Math.max(5, scaledProgress));
      onProgress(safeProgress, "uploading");
    };

    xhr.upload.onload = () => {
      uploadComplete = true;
      // Upload finished, now server is processing
      onProgress(90, "processing");
    };

    xhr.onprogress = () => {
      // Response downloading (small for JSON responses)
      if (uploadComplete) {
        onProgress(95, "processing");
      }
    };

    xhr.onerror = () => {
      onProgress(0, "error");
      reject(new Error("Network error during upload. Please check your connection and try again."));
    };

    xhr.ontimeout = () => {
      onProgress(0, "error");
      reject(new Error("Upload timed out. File may be too large or connection is slow."));
    };

    xhr.onabort = () => {
      onProgress(0, "error");
      reject(new Error("Upload was cancelled."));
    };

    xhr.onload = () => {
      // Server processing complete
      onProgress(98, "processing");

      let payload: UploadResult | null = null;

      try {
        payload = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        // Edge function might return empty body on success
        payload = null;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        // Success - extract URL from response or construct it
        const url = payload?.url;
        
        if (!url) {
          // If no URL in response, the edge function didn't return properly
          // But we can still consider it a success if status is 2xx
          console.warn("Upload succeeded but no URL returned in response");
        }

        onProgress(100, "complete");
        resolve({ 
          url: url || "", // Return empty string if no URL, handle in caller
          ...(payload?.error && { error: payload.error }),
          ...(payload?.details && { details: payload.details })
        });
        return;
      }

      // Error status codes
      onProgress(0, "error");
      const errorMsg = payload?.error || payload?.details || `Upload failed (${xhr.status})`;
      reject(new Error(errorMsg));
    };

    xhr.send(file);
  });
}

export function useR2Upload() {
  const [state, setState] = useState<UploadState>({
    progress: 0,
    phase: "preparing",
    uploading: false,
  });

  const setProgress = useCallback((progress: number, phase: UploadPhase) => {
    setState({
      progress,
      phase,
      uploading: phase !== "complete" && phase !== "error",
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

    // Validation
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
    }

    if (acceptedTypes && !acceptedTypes.some((type) => file.type.startsWith(type))) {
      throw new Error(`File type ${file.type} not accepted`);
    }

    setProgress(0, "preparing");

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;

      // Get fresh session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData?.session?.access_token) {
        throw new Error("Authentication required. Please sign in again.");
      }

      const token = sessionData.session.access_token;
      setProgress(5, "preparing");

      // Construct URL
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      if (!projectId) {
        throw new Error("Missing VITE_SUPABASE_PROJECT_ID environment variable");
      }

      const url = `https://${projectId}.supabase.co/functions/v1/r2-upload?path=${encodeURIComponent(fileName)}`;

      setProgress(10, "uploading");

      const result = await uploadWithXhr({
        url,
        file,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-file-content-type": file.type,
          "x-file-size": file.size.toString(),
        },
        onProgress: setProgress,
      });

      // Validate we got a URL back
      if (!result.url) {
        throw new Error("Upload completed but no URL was returned. Please check your edge function configuration.");
      }

      // Small delay to show 100% completion
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      return result.url;
    } catch (error) {
      setProgress(0, "error");
      
      // Re-throw with better message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown upload error occurred");
    } finally {
      // Reset after a delay if successful, immediately if error
      setTimeout(() => {
        setState({
          progress: 0,
          phase: "preparing",
          uploading: false,
        });
      }, state.phase === "complete" ? 2000 : 0);
    }
  }, [setProgress, state.phase]);

  // Backwards compatibility - expose old interface
  const uploading = state.uploading;
  const progress = state.progress;

  return { 
    upload, 
    uploading, 
    progress,
    phase: state.phase, // New: expose current phase
  };
}
