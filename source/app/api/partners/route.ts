import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    // Path to the partners directory
    const partnersDir = path.join(process.cwd(), 'public', 'partners');
    
    // Read all files in the directory
    const files = fs.readdirSync(partnersDir);
    
    // Filter for image files and create partner logo objects
    const partnerLogos = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file))
      .map((file, index) => ({
        id: index + 1,
        src: `/partners/${file}`,
        alt: `Partner ${index + 1}`
      }));
    
    return NextResponse.json(partnerLogos);
  } catch (error) {
    console.error('Error fetching partner logos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partner logos' },
      { status: 500 }
    );
  }
}