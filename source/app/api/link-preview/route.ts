import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    // Validate URL
    const urlObj = new URL(url)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 })
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)'
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 seconds
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract meta information
    const title = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      'No title found'

    const description = 
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      'Geen geen beschrijving gevonden'

    let image = 
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('link[rel="icon"]').attr('href') ||
      ''

    // Convert relative URLs to absolute
    if (image && !image.startsWith('http')) {
      try {
        image = new URL(image, url).href
      } catch (e) {
        image = ''
      }
    }

    const preview = {
      title: title.trim(),
      description: description.trim(),
      image: image,
      url: url
    }

    return NextResponse.json(preview)

  } catch (error) {
    console.error('Error fetching link preview:', error)
    
    // Return basic fallback data
    return NextResponse.json({
      title: 'Link Preview',
      description: 'Geen beschrijving beschikbaar',
      image: '',
      url: url
    })
  }
}