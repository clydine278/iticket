import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UploadOptions {
  folder?: string;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export function useR2Upload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File, options: UploadOptions = {}): Promise<string | null> => {
    const { folder = "uploads", maxSizeMB = 10, acceptedTypes } = options;

    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
    }

    if (acceptedTypes && !acceptedTypes.some((t) => file.type.startsWith(t))) {
      throw new Error(`File type ${file.type} not accepted`);
    }

    setUploading(true);
    setProgress(0);

    try {
      const ext = file.name.split(".").pop() || "bin";
      const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;

      setProgress(30);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/r2-upload?path=${encodeURIComponent(fileName)}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-file-content-type": file.type,
        },
        body: file,
      });

      setProgress(80);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Upload failed");
      }

      const result = await response.json();
      setProgress(100);
      return result.url;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress };
}
