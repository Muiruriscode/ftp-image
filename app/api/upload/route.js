import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import sharp from 'sharp';
import FTPClient from '@/lib/ftp-upload';

export async function POST(request) {
  let ftpClient = null;
  
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const title = formData.get('title');
    const description = formData.get('description');
    const category = formData.get('category');
    const imageType = formData.get('type') || 'hero';

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only JPEG, PNG, WebP, GIF are allowed.` },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for FTP)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalFilename = file.name.toLowerCase().replace(/[^a-z0-9.]/g, '-');
    const fileExtension = originalFilename.split('.').pop();
    const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    const optimizedFilename = `optimized-${uniqueFilename.replace(/\.[^/.]+$/, '')}.webp`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create optimized version for web
    let optimizedBuffer;
    try {
      optimizedBuffer = await sharp(buffer)
        .resize(1200, 800, {
          fit: 'cover',
          withoutEnlargement: true,
          position: 'center'
        })
        .webp({ 
          quality: 80,
          effort: 6
        })
        .toBuffer();
    } catch (sharpError) {
      console.warn('Sharp optimization failed, using original:', sharpError);
      optimizedBuffer = buffer; // Fallback to original
    }

    // Initialize FTP client
    ftpClient = new FTPClient();
    await ftpClient.connect();

    // FTP Paths - Updated based on your config
    const ftpBasePath = '/public_html/uploads/';
    const ftpOriginalPath = ftpBasePath + 'originals/';
    const ftpOptimizedPath = ftpBasePath + 'optimized/';

    // Ensure directories exist on FTP
    await ftpClient.ensureDirectory(ftpOriginalPath);
    await ftpClient.ensureDirectory(ftpOptimizedPath);

    // Upload both versions to FTP
    console.log('Uploading to FTP...');
    
    // Upload original
    const originalUpload = await ftpClient.uploadFile(
      buffer,
      ftpOriginalPath,
      uniqueFilename
    );

    // Upload optimized
    const optimizedUpload = await ftpClient.uploadFile(
      optimizedBuffer,
      ftpOptimizedPath,
      optimizedFilename
    );

    // Generate URLs for database
    const ftpBaseUrl = process.env.FTP_BASE_URL || '/domains/hammingbconnection.co.ke/public_html/uploads';
    const originalUrl = `${ftpBaseUrl}/originals/${uniqueFilename}`;
    const optimizedUrl = `${ftpBaseUrl}/optimized/${optimizedFilename}`;

    // Also create public URLs for web access
    const publicBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hammingbconnection.co.ke';
    const publicOriginalUrl = `${publicBaseUrl}/uploads/originals/${uniqueFilename}`;
    const publicOptimizedUrl = `${publicBaseUrl}/uploads/optimized/${optimizedFilename}`;

    // Save to database
    const sql = `
      INSERT INTO images 
      (title, description, filename, filepath, url, original_url, category, type, uploaded_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const params = [
      title || originalFilename.replace(/-/g, ' ').replace(/\.[^/.]+$/, ''),
      description || '',
      uniqueFilename,
      ftpOptimizedPath + optimizedFilename,
      publicOptimizedUrl, // Use public URL for web access
      publicOriginalUrl,
      category || 'general',
      imageType
    ];

    const result = await query(sql, params);

    // Disconnect FTP
    ftpClient.disconnect();

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully to FTP',
      data: {
        id: result.insertId,
        title: params[0],
        filename: uniqueFilename,
        url: publicOptimizedUrl,
        originalUrl: publicOriginalUrl,
        ftpPath: ftpOptimizedPath + optimizedFilename,
        type: imageType,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Ensure FTP client disconnects on error
    if (ftpClient) {
      ftpClient.disconnect();
    }

    return NextResponse.json(
      { 
        error: 'Upload failed',
        details: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}

// GET method to verify FTP connection
export async function GET(request) {
  let ftpClient = null;
  
  try {
    ftpClient = new FTPClient();
    await ftpClient.connect();
    
    // Test listing the uploads directory
    const testPath = '/public_html/uploads/';
    const listing = await ftpClient.listDirectory(testPath);
    
    ftpClient.disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'FTP connection successful',
      path: testPath,
      files: listing.map(item => ({
        name: item.name,
        type: item.type,
        size: item.size,
        date: item.date
      }))
    });
    
  } catch (error) {
    if (ftpClient) {
      ftpClient.disconnect();
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'FTP connection failed',
        details: error.message,
        config: {
          host: process.env.FTP_HOST,
          user: process.env.FTP_USER,
          port: process.env.FTP_PORT
        }
      },
      { status: 500 }
    );
  }
}