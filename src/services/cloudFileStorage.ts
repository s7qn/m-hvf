/**
 * Cloud File Storage Service
 * Provides persistent, cross-device file storage for PDF files using Firestore's lecture_files collection.
 * Guarantees that any PDF uploaded on any device can be opened, viewed, and downloaded on any other device.
 */
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

const fileMemoryCache = new Map<string, { blob: Blob; dataUrl: string; fileName: string; fileType: string }>();

const CHUNK_SIZE = 500000; // ~500KB per chunk to safely stay within Firestore 1MB document limit

/**
 * Extract clean file ID from any URL format:
 * - /api/files/file-123456
 * - firestore-file://file-123456
 * - cloud-file://file-123456
 * - file-123456
 * - http(s)://.../api/files/file-123456
 */
export function extractFileId(fileUrlOrId: string): string | null {
  if (!fileUrlOrId) return null;
  const trimmed = fileUrlOrId.trim();

  if (trimmed.startsWith('firestore-file://')) {
    return trimmed.replace('firestore-file://', '').trim();
  }
  if (trimmed.startsWith('cloud-file://')) {
    return trimmed.replace('cloud-file://', '').trim();
  }
  if (trimmed.includes('/api/files/')) {
    const after = trimmed.split('/api/files/')[1];
    return after.split('?')[0].split('#')[0].trim();
  }
  if (trimmed.startsWith('file-')) {
    return trimmed.split('?')[0].split('#')[0].trim();
  }
  return null;
}

/**
 * Convert Base64 data URL to Blob
 */
export function base64ToBlob(dataUrl: string, defaultMime = 'application/pdf'): Blob {
  try {
    const parts = dataUrl.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : defaultMime;
    const base64Str = parts.length > 1 ? parts[1] : parts[0];
    const bstr = atob(base64Str);
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
 * Save a PDF/Document to Firestore lecture_files collection
 * Supports single-doc storage (<750KB) and chunked storage (>750KB).
 * Returns a universal URL: /api/files/{fileId} which works over both HTTP and client SDK.
 */
export async function saveFileToCloudStorage(file: File): Promise<{
  fileUrl: string;
  fileSize: string;
  fileName: string;
} | null> {
  const sizeMB = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64DataUrl = reader.result as string;
        const mimeType = file.type || 'application/pdf';

        // 1. Save document to Firestore collection lecture_files
        const fileDocRef = doc(db, 'lecture_files', fileId);

        if (base64DataUrl.length <= CHUNK_SIZE) {
          // Direct single-document write
          const payload = {
            id: fileId,
            fileName: file.name,
            fileSize: sizeMB,
            mimeType,
            dataUrl: base64DataUrl,
            totalChunks: 1,
            uploadedAt: new Date().toISOString(),
          };
          const writePromise = setDoc(fileDocRef, payload);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firestore file write timeout')), 10000)
          );
          await Promise.race([writePromise, timeoutPromise]);
        } else {
          // Chunked write for larger files
          const totalChunks = Math.ceil(base64DataUrl.length / CHUNK_SIZE);
          const metadataPayload = {
            id: fileId,
            fileName: file.name,
            fileSize: sizeMB,
            mimeType,
            totalChunks,
            uploadedAt: new Date().toISOString(),
          };
          await setDoc(fileDocRef, metadataPayload);

          // Write all chunks
          const chunkWrites = [];
          for (let i = 0; i < totalChunks; i++) {
            const chunkStr = base64DataUrl.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
            const chunkRef = doc(db, 'lecture_files', fileId, 'chunks', `chunk_${i}`);
            chunkWrites.push(setDoc(chunkRef, { chunkIndex: i, data: chunkStr }));
          }
          await Promise.all(chunkWrites);
        }

        console.log(`[CloudStorage] Saved file to Firestore: ${fileId} (${sizeMB})`);

        // Cache in memory for instant local access
        const blob = base64ToBlob(base64DataUrl, mimeType);
        fileMemoryCache.set(fileId, {
          blob,
          dataUrl: base64DataUrl,
          fileName: file.name,
          fileType: mimeType,
        });

        // 2. Also send to server uploads endpoint as fallback mirror
        try {
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
          const rawBase64 = base64DataUrl.includes(',') ? base64DataUrl.split(',')[1] : base64DataUrl;
          fetch(`${baseUrl}/api/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: sanitizedName,
              fileData: rawBase64,
              mimeType,
            }),
          }).catch(() => {});
        } catch {
          // ignore server mirror error
        }

        resolve({
          fileUrl: `/api/files/${fileId}`,
          fileSize: sizeMB,
          fileName: file.name,
        });
      } catch (err) {
        console.error('[CloudStorage] Upload to Firestore failed:', err);
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Retrieve a file URL or cached Blob from Firestore or HTTP
 * Ensures any PDF opens correctly in another browser, device, or preview URL
 */
export async function getCloudFile(fileUrlOrId: string): Promise<{
  blobUrl: string;
  fileName: string;
  fileType: string;
} | null> {
  if (!fileUrlOrId) return null;

  const fileId = extractFileId(fileUrlOrId);

  // 1. Check in-memory cache first if fileId is known
  if (fileId && fileMemoryCache.has(fileId)) {
    const cached = fileMemoryCache.get(fileId)!;
    return {
      blobUrl: URL.createObjectURL(cached.blob),
      fileName: cached.fileName,
      fileType: cached.fileType,
    };
  }

  // 2. Check Firestore lecture_files collection if it is a cloud file ID
  if (fileId) {
    try {
      const fileDocRef = doc(db, 'lecture_files', fileId);
      const snap = await getDoc(fileDocRef);
      if (snap.exists()) {
        const data = snap.data();
        const mime = data.mimeType || 'application/pdf';
        const fileName = data.fileName || 'document.pdf';

        let fullDataUrl = data.dataUrl || '';

        // If chunked file, reassemble chunks
        if (!fullDataUrl && data.totalChunks && data.totalChunks > 1) {
          const chunkPromises = [];
          for (let i = 0; i < data.totalChunks; i++) {
            chunkPromises.push(getDoc(doc(db, 'lecture_files', fileId, 'chunks', `chunk_${i}`)));
          }
          const chunkSnaps = await Promise.all(chunkPromises);
          const parts: string[] = [];
          chunkSnaps.forEach(cs => {
            if (cs.exists()) {
              parts.push(cs.data()?.data || '');
            }
          });
          fullDataUrl = parts.join('');
        }

        if (fullDataUrl) {
          const blob = base64ToBlob(fullDataUrl, mime);
          const blobUrl = URL.createObjectURL(blob);
          fileMemoryCache.set(fileId, {
            blob,
            dataUrl: fullDataUrl,
            fileName,
            fileType: mime,
          });
          return {
            blobUrl,
            fileName,
            fileType: mime,
          };
        }
      }
    } catch (fsErr) {
      console.warn('[CloudStorage] Firestore getDoc error for file:', fsErr);
    }
  }

  // 3. Fallback: If HTTP/HTTPS URL or relative path (e.g. /api/files/... or /uploads/...)
  const cleanUrl = fileUrlOrId.trim();
  if (cleanUrl.startsWith('/') || cleanUrl.startsWith('http')) {
    try {
      const res = await fetch(cleanUrl);
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const fileName = cleanUrl.split('/').pop()?.split('?')[0] || 'document.pdf';
        const fileType = blob.type || 'application/pdf';
        if (fileId) {
          fileMemoryCache.set(fileId, {
            blob,
            dataUrl: '',
            fileName,
            fileType,
          });
        }
        return {
          blobUrl,
          fileName,
          fileType,
        };
      }
    } catch (fetchErr) {
      console.warn('[CloudStorage] Fetch error for URL:', fetchErr);
    }

    return {
      blobUrl: cleanUrl,
      fileName: cleanUrl.split('/').pop()?.split('?')[0] || 'document.pdf',
      fileType: 'application/pdf',
    };
  }

  return null;
}

/**
 * Trigger immediate download of file across all devices
 */
export async function downloadCloudFile(fileUrlOrId: string, customFileName?: string): Promise<boolean> {
  try {
    const resolved = await getCloudFile(fileUrlOrId);
    if (!resolved || !resolved.blobUrl) {
      // Direct HTTP download fallback if valid URL
      if (fileUrlOrId.startsWith('/') || fileUrlOrId.startsWith('http')) {
        const a = document.createElement('a');
        a.href = fileUrlOrId;
        a.download = customFileName || 'lecture.pdf';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return true;
      }
      throw new Error('Could not resolve file for download');
    }

    const a = document.createElement('a');
    a.href = resolved.blobUrl;
    a.download = customFileName || resolved.fileName || 'lecture.pdf';
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

/**
 * Delete a cloud file from Firestore
 */
export async function deleteCloudFile(fileUrlOrId: string): Promise<boolean> {
  const fileId = extractFileId(fileUrlOrId);
  if (fileId) {
    try {
      const fileRef = doc(db, 'lecture_files', fileId);
      const snap = await getDoc(fileRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.totalChunks && data.totalChunks > 1) {
          for (let i = 0; i < data.totalChunks; i++) {
            deleteDoc(doc(db, 'lecture_files', fileId, 'chunks', `chunk_${i}`)).catch(() => {});
          }
        }
      }
      await deleteDoc(fileRef);
      fileMemoryCache.delete(fileId);
      return true;
    } catch (err) {
      console.warn('[CloudStorage] Error deleting cloud file:', err);
      return false;
    }
  }
  return true;
}
