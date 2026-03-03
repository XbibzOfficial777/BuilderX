import { NextRequest, NextResponse } from 'next/server';

const CATBOX_API_URL = 'https://catbox.moe/user/api.php';
const CATBOX_USERHASH = '5248d18542a1e43ae36a18ba0';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (40MB max)
    const maxSize = 40 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 40MB.' 
      }, { status: 400 });
    }

    // Upload to Catbox
    const catboxFormData = new FormData();
    catboxFormData.append('reqtype', 'fileupload');
    catboxFormData.append('userhash', CATBOX_USERHASH);
    catboxFormData.append('fileToUpload', file);

    const response = await fetch(CATBOX_API_URL, {
      method: 'POST',
      body: catboxFormData,
    });

    if (!response.ok) {
      throw new Error(`Catbox API error: ${response.status}`);
    }

    const url = await response.text();
    const cleanUrl = url.trim();

    if (!cleanUrl.startsWith('https://')) {
      throw new Error('Invalid response from Catbox');
    }

    return NextResponse.json({ 
      success: true, 
      url: cleanUrl 
    });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}
