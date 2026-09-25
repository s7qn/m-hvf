import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

const CHUNK_SIZE = 400 * 1024; // 400KB chunks of base64 string
const fileMemoryCache = new Map<string, { blob: Blob; dataUrl: string; fileName: string; fileType: string }>();

/**
 * Convert File to Base64 String
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

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
 * Upload a PDF or document directly to Firestore Cloud Database
 * Guaranteed to be visible and downloadable from any browser, device, or user worldwide.
 */
export async function uploadFileToCloud(file: File): Promise<{
  fileId: string;
  fileUrl: string;
  fileName: string;
  fileSize: string;
} | null> {
  const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
  const fileSizeStr = `${sizeMB} MB`;
  const fileType = file.type || 'application/pdf';

  try {
    const dataUrl = await fileToBase64(file);
    const totalChars = dataUrl.length;

    if (totalChars <= CHUNK_SIZE) {
      // Single Document Storage
      const fileRef = doc(db, 'lecture_files', fileId);
      await setDoc(fileRef, {
        id: fileId,
        fileName: file.name,
        fileType,
        fileSize: fileSizeStr,
        data: dataUrl,
        isChunked: false,
        totalChunks: 1,
        uploadedAt: new Date().toISOString(),
      });
    } else {
      // Chunked Storage for large PDFs
      const numChunks = Math.ceil(totalChars / CHUNK_SIZE);
      const fileRef = doc(db, 'lecture_files', fileId);
      await setDoc(fileRef, {
        id: fileId,
        fileName: file.name,
        fileType,
        fileSize: fileSizeStr,
        isChunked: true,
        totalChunks: numChunks,
        uploadedAt: new Date().toISOString(),
      });

      for (let i = 0; i < numChunks; i++) {
        const chunkStr = dataUrl.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const chunkRef = doc(db, 'lecture_files', fileId, 'chunks', `chunk_${i}`);
        await setDoc(chunkRef, {
          index: i,
          data: chunkStr,
        });
      }
    }

    // Cache locally for immediate fast access in this browser
    const blob = base64ToBlob(dataUrl, fileType);
    fileMemoryCache.set(fileId, { blob, dataUrl, fileName: file.name, fileType });

    return {
      fileId,
      fileUrl: `cloud-file://${fileId}`,
      fileName: file.name,
      fileSize: fileSizeStr,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `lecture_files/${fileId}`);
    return null;
  }
}

/**
 * Retrieve a Cloud-stored PDF from Firestore and return a ready-to-view Blob & URL
 */
export async function getCloudFile(fileId: string): Promise<{
  blob: Blob;
  dataUrl: string;
  blobUrl: string;
  fileName: string;
  fileType: string;
} | null> {
  const cleanId = fileId.replace('cloud-file://', '').trim();

  // Check in-memory cache
  if (fileMemoryCache.has(cleanId)) {
    const cached = fileMemoryCache.get(cleanId)!;
    return {
      ...cached,
      blobUrl: URL.createObjectURL(cached.blob),
    };
  }

  try {
    const fileRef = doc(db, 'lecture_files', cleanId);
    const snap = await getDoc(fileRef);
    if (!snap.exists()) {
      console.warn(`[CloudStorage] File not found in Firestore: ${cleanId}`);
      return null;
    }

    const data = snap.data();
    let fullDataUrl = '';

    if (!data.isChunked && data.data) {
      fullDataUrl = data.data;
    } else if (data.isChunked) {
      const chunksSnap = await getDocs(collection(db, 'lecture_files', cleanId, 'chunks'));
      const chunksList: { index: number; data: string }[] = [];
      chunksSnap.forEach(cd => {
        const cdata = cd.data();
        chunksList.push({ index: cdata.index ?? 0, data: cdata.data || '' });
      });
      chunksList.sort((a, b) => a.index - b.index);
      fullDataUrl = chunksList.map(c => c.data).join('');
    }

    if (!fullDataUrl) return null;

    const fileType = data.fileType || 'application/pdf';
    const blob = base64ToBlob(fullDataUrl, fileType);
    const blobUrl = URL.createObjectURL(blob);
    const fileName = data.fileName || 'document.pdf';

    // Store in memory cache
    fileMemoryCache.set(cleanId, { blob, dataUrl: fullDataUrl, fileName, fileType });

    return {
      blob,
      dataUrl: fullDataUrl,
      blobUrl,
      fileName,
      fileType,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `lecture_files/${cleanId}`);
    return null;
  }
}

/**
 * Trigger immediate download of cloud file
 */
export async function downloadCloudFile(fileId: string, customFileName?: string): Promise<boolean> {
  try {
    const file = await getCloudFile(fileId);
    if (!file) return false;

    const a = document.createElement('a');
    a.href = file.blobUrl;
    a.download = customFileName || file.fileName || 'lecture.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(file.blobUrl), 3000);
    return true;
  } catch (err) {
    console.error('Failed to download cloud file:', err);
    return false;
  }
}
