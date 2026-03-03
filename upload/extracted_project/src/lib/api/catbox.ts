interface UploadResponse {
  success: boolean;
  data: string;
  error?: string;
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', file, file.name); // Include filename

  const response = await fetch('/api/catbox', {
    method: 'POST',
    body: formData,
  });

  const result: UploadResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to upload file');
  }

  return result.data;
}

export async function uploadFromUrl(url: string): Promise<string> {
  const formData = new FormData();
  formData.append('reqtype', 'urlupload');
  formData.append('url', url);

  const response = await fetch('/api/catbox', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload from URL');
  }

  const result: UploadResponse = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to upload from URL');
  }

  return result.data;
}

export async function deleteFiles(files: string[]): Promise<void> {
  const formData = new FormData();
  formData.append('reqtype', 'deletefiles');
  formData.append('files', files.join(' '));

  const response = await fetch('/api/catbox', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to delete files');
  }

  const result: UploadResponse = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete files');
  }
}

export async function createAlbum(
  title: string,
  description: string,
  files: string[]
): Promise<string> {
  const formData = new FormData();
  formData.append('reqtype', 'createalbum');
  formData.append('title', title);
  formData.append('desc', description);
  formData.append('files', files.join(' '));

  const response = await fetch('/api/catbox', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to create album');
  }

  const result: UploadResponse = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to create album');
  }

  // Extract short code from URL like https://catbox.moe/c/xxxxx
  const match = result.data.match(/\/c\/([a-zA-Z0-9]+)/);
  return match ? match[1] : result.data;
}

export async function editAlbum(
  short: string,
  title: string,
  description: string,
  files: string[]
): Promise<void> {
  const formData = new FormData();
  formData.append('reqtype', 'editalbum');
  formData.append('short', short);
  formData.append('title', title);
  formData.append('desc', description);
  formData.append('files', files.join(' '));

  const response = await fetch('/api/catbox', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to edit album');
  }

  const result: UploadResponse = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to edit album');
  }
}

export async function addToAlbum(short: string, files: string[]): Promise<void> {
  const formData = new FormData();
  formData.append('reqtype', 'addtoalbum');
  formData.append('short', short);
  formData.append('files', files.join(' '));

  const response = await fetch('/api/catbox', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to add files to album');
  }

  const result: UploadResponse = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to add files to album');
  }
}

export async function removeFromAlbum(short: string, files: string[]): Promise<void> {
  const formData = new FormData();
  formData.append('reqtype', 'removefromalbum');
  formData.append('short', short);
  formData.append('files', files.join(' '));

  const response = await fetch('/api/catbox', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to remove files from album');
  }

  const result: UploadResponse = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to remove files from album');
  }
}

export async function deleteAlbum(short: string): Promise<void> {
  const formData = new FormData();
  formData.append('reqtype', 'deletealbum');
  formData.append('short', short);

  const response = await fetch('/api/catbox', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to delete album');
  }

  const result: UploadResponse = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete album');
  }
}

export function getFileType(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
  return 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function getFileNameFromUrl(url: string): string {
  return url.split('/').pop() || 'unknown';
}
