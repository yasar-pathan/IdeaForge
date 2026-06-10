import { NextRequest, NextResponse } from 'next/server';
import { recordVisit } from '@/frontend/lib/traffic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Split x-forwarded-for if multiple hops are present
    const clientIp = ip.split(',')[0].trim();

    recordVisit(clientIp, userAgent);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Traffic ping error:', error);
    return NextResponse.json({ error: 'Failed to log traffic' }, { status: 500 });
  }
}
