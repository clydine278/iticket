import { useState } from "react";
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

function uploadWithXhr({
  url,
  file,
  headers,
  onProgress,
}: {
  url: string;
  file: File;
  headers: Record<string, string>;
  onProgress: (value: number) => void;
}) {
  return new Promise<UploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", url);

    Object.entries(headers).forEach(([key, value]) => {
      if (value) xhr.setRequestHeader(key, value);
    });

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) return;
      const nextProgress = Math.min(95, Math.max(15, Math.round((event.loaded / event.total) * 90)));
      onProgress(nextProgress);
    };

    xhr.onerror = () => {
      reject(new Error("Upload failed. Please try again."));
    };

    xhr.onabort = () => {
      reject(new Error("Upload was cancelled."));
    };

    xhr.onload = () => {
      let payload: UploadResult | null = null;

      try {
        payload = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        payload = null;
      }

      if (xhr.status >= 200 && xhr.status < 300 && payload?.url) {
        resolve(payload);
        return;
      }

      reject(new Error(payload?.error || payload?.details || `Upload failed (${xhr.status})`));
    };

    xhr.send(file);
  });
}

export function useR2Upload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File, options: UploadOptions = {}): Promise<string | null> => {
    const { folder = "uploads", maxSizeMB = 10, acceptedTypes } = options;

    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
    }

    if (acceptedTypes && !acceptedTypes.some((type) => file.type.startsWith(type))) {
      throw new Error(`File type ${file.type} not accepted`);
    }

    setUploading(true);
    setProgress(5);

    try {
      const ext = file.name.split(".").pop() || "bin";
      const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error("Please sign in again before uploading.");
      }

      setProgress(10);

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/r2-upload?path=${encodeURIComponent(fileName)}`;

      const result = await uploadWithXhr({
        url,
        file,
        headers: {
          Authorization: `Bearer ${token}`,
          "x-file-content-type": file.type,
        },
        onProgress: setProgress,
      });

      setProgress(100);
      return result.url;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress };
}
