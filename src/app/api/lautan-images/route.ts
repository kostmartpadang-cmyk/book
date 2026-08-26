import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import path from 'path';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'lautan');
    const files = await readdir(dir);
    const images = files
      .filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()) && !f.startsWith('ornament-'))
      .map((f) => `/lautan/${f}`);

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error reading /public/lautan:', error);
    return NextResponse.json({ images: [] });
  }
}
