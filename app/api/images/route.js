import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit')) || 100;

    let sql = 'SELECT * FROM images WHERE is_active = true';
    const params = [];

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY uploaded_at DESC LIMIT ?';
    params.push(limit);

    const images = await query(sql, params);

    return NextResponse.json({
      success: true,
      count: images.length,
      data: images
    });

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}