/**
 * Supabase Storage Client using S3-like REST API
 * Direct API calls without Supabase JS client dependency
 */

export interface SupabaseStorageConfig {
  url: string;
  anonKey: string;
}

export interface UploadOptions {
  bucket: string;
  path?: string;
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
}

export interface UploadResult {
  path: string;
  url: string;
  fullPath: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Cache config to avoid repeated fetches
let cachedConfig: SupabaseStorageConfig | null = null;

/**
 * Get Supabase configuration from environment or API
 */
async function getSupabaseConfig(): Promise<SupabaseStorageConfig> {
  // Return cached config if available
  if (cachedConfig) {
    return cachedConfig;
  }
  
  // Try to get from environment first
  if (typeof window !== "undefined") {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      cachedConfig = { url: supabaseUrl, anonKey: supabaseAnonKey };
      return cachedConfig;
    }
  }
  
  // Fallback: Get from backend API endpoint
  try {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000/api";
    // Ensure it ends with /api
    if (!apiUrl.endsWith('/api')) {
      apiUrl = apiUrl.endsWith('/') ? `${apiUrl}api` : `${apiUrl}/api`;
    }
    const response = await fetch(`${apiUrl}/config/supabase`, {
      credentials: "include",
    });
    if (response.ok) {
      const config = await response.json();
      cachedConfig = { url: config.url, anonKey: config.anonKey };
      return cachedConfig;
    }
  } catch (error) {
    console.error("Failed to get Supabase config from API:", error);
  }
  
  throw new Error("Supabase configuration not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables, or ensure the backend provides /config/supabase endpoint.");
}

/**
 * Generate unique file path
 */
function generateFilePath(originalName: string, userId?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.substring(originalName.lastIndexOf("."));
  const folder = userId ? `users/${userId}` : "uploads";
  return `${folder}/${timestamp}-${random}${extension}`;
}

/**
 * Upload file to Supabase Storage using S3-like REST API
 */
export async function uploadFile(
  file: File,
  options: UploadOptions,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const config = await getSupabaseConfig();
  const path = options.path || generateFilePath(file.name);
  const bucket = options.bucket;
  const contentType = options.contentType || file.type || "application/octet-stream";
  
  const url = `${config.url}/storage/v1/object/${bucket}/${path}`;
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
          });
        }
      });
    }
    
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const publicUrl = `${config.url}/storage/v1/object/public/${bucket}/${path}`;
        resolve({
          path,
          url: publicUrl,
          fullPath: `${bucket}/${path}`,
        });
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });
    
    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });
    
    xhr.addEventListener("abort", () => {
      reject(new Error("Upload aborted"));
    });
    
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Authorization", `Bearer ${config.anonKey}`);
    xhr.setRequestHeader("Content-Type", contentType);
    
    if (options.cacheControl) {
      xhr.setRequestHeader("Cache-Control", options.cacheControl);
    }
    
    if (options.upsert) {
      xhr.setRequestHeader("x-upsert", "true");
    }
    
    xhr.send(file);
  });
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<void> {
  const config = await getSupabaseConfig();
  const url = `${config.url}/storage/v1/object/${bucket}/${path}`;
  
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${config.anonKey}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `Delete failed with status ${response.status}`);
  }
}

/**
 * Get signed URL for private file access
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const config = await getSupabaseConfig();
  const url = `${config.url}/storage/v1/object/sign/${bucket}/${path}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expiresIn }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.message || `Failed to get signed URL: ${response.status}`);
  }
  
  const data = await response.json();
  return `${config.url}${data.signedURL}`;
}

