import { NextRequest, NextResponse } from 'next/server';

const CATBOX_API_URL = 'https://catbox.moe/user/api.php';
const CATBOX_USERHASH = '5248d18542a1e43ae36a18ba0';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get request type
    let reqtype = formData.get('reqtype') as string;
    
    // Find the file from any possible field name
    let file: File | null = null;
    let fileFieldName = 'fileToUpload';
    
    const possibleFileFields = ['fileToUpload', 'file', 'image', 'video', 'audio', 'media'];
    for (const fieldName of possibleFileFields) {
      const possibleFile = formData.get(fieldName);
      if (possibleFile instanceof File && possibleFile.size > 0) {
        file = possibleFile;
        fileFieldName = fieldName;
        break;
      }
    }

    // If we have a file, it's a file upload
    if (file) {
      reqtype = 'fileupload';
    }

    // Create new FormData for Catbox
    const catboxFormData = new FormData();
    catboxFormData.append('reqtype', reqtype || 'fileupload');
    catboxFormData.append('userhash', CATBOX_USERHASH);

    // Handle file upload
    if (reqtype === 'fileupload' && file) {
      // Validate file size (200MB max for Catbox)
      const maxSize = 200 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, error: 'File too large. Maximum size is 200MB.' },
          { status: 400 }
        );
      }

      // Always use fileToUpload for Catbox
      catboxFormData.append('fileToUpload', file, file.name || 'file');
      
      console.log('Uploading file to Catbox:', {
        originalField: fileFieldName,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
    } else {
      // Forward all other form data
      for (const [key, value] of formData.entries()) {
        if (key !== 'reqtype' && key !== 'userhash' && !(value instanceof File)) {
          catboxFormData.append(key, value);
        }
      }
    }

    const response = await fetch(CATBOX_API_URL, {
      method: 'POST',
      body: catboxFormData,
    });

    const responseText = await response.text();
    console.log('Catbox response:', response.status, responseText.substring(0, 200));

    if (!response.ok) {
      // Parse error message from Catbox
      let errorMessage = `Upload failed (${response.status})`;
      if (responseText.includes('File too big')) {
        errorMessage = 'File too large for Catbox (max 200MB)';
      } else if (responseText.includes('Invalid file') || responseText.includes('No file')) {
        errorMessage = 'Invalid file or no file detected';
      } else if (responseText.includes('rate limit')) {
        errorMessage = 'Rate limited. Please try again later.';
      } else if (responseText.includes('412')) {
        errorMessage = 'File upload failed. Please try again.';
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage, details: responseText.substring(0, 200) },
        { status: 500 }
      );
    }

    // Check if response is an error message
    if (responseText.includes('ERROR') || responseText.includes('Failed') || responseText.includes('No file')) {
      return NextResponse.json(
        { success: false, error: responseText.trim() },
        { status: 500 }
      );
    }
    
    // Success - return the URL
    const url = responseText.trim();
    if (url.startsWith('http')) {
      return NextResponse.json({ 
        success: true, 
        data: url 
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Unexpected response from Catbox', details: url },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Catbox API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
