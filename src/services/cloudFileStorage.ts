/**
 * Cloud File Utilities
 * Provides clean blob conversion and download helpers without overloading Firestore write streams.
 */

const fileMemoryCache = new Map<string, { blob: Blob; dataUrl: string; fileName: string; fileType: string }>();

/**
 * Convert Base64 data URL to Blob
 */
export function base64ToBlob(dataUrl: string, defaultMime = 'application/pdf'): Blob {
  try {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : defaultMime;
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (err) {
    console.error('Error converting base64 to Blob:', err);
    return new Blob([], { type: defaultMime });
  }
}

/**
 * Retrieve a file URL or cached Blob
 */
export async function getCloudFile(fileUrlOrId: string): Promise<{
  blobUrl: string;
  fileName: string;
  fileType: string;
} | null> {
  const clean = fileUrlOrId.replace('cloud-file://', '').trim();

  // If already an HTTP/uploads URL, return it directly
  if (clean.startsWith('/') || clean.startsWith('http')) {
    return {
      blobUrl: clean,
      fileName: clean.split('/').pop() || 'document.pdf',
      fileType: 'application/pdf',
    };
  }

  // Check in-memory cache
  if (fileMemoryCache.has(clean)) {
    const cached = fileMemoryCache.get(clean)!;
    return {
      blobUrl: URL.createObjectURL(cached.blob),
      fileName: cached.fileName,
      fileType: cached.fileType,
    };
  }

  return {
    blobUrl: clean,
    fileName: 'document.pdf',
    fileType: 'application/pdf',
  };
}

/**
 * Trigger immediate download of file
 */
export async function downloadCloudFile(fileUrlOrId: string, customFileName?: string): Promise<boolean> {
  try {
    const cleanUrl = fileUrlOrId.replace('cloud-file://', '').trim();
    const a = document.createElement('a');
    a.href = cleanUrl;
    a.download = customFileName || cleanUrl.split('/').pop() || 'lecture.pdf';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (err) {
    console.error('Failed to download file:', err);
    return false;
  }
}
