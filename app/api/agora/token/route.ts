import { NextRequest, NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

export async function POST(request: NextRequest) {
  try {
    const { channelName, userId } = await request.json();

    if (!channelName || !userId) {
      return NextResponse.json(
        { error: 'Channel name and user ID are required' },
        { status: 400 }
      );
    }

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return NextResponse.json(
        { error: 'Agora credentials not configured' },
        { status: 500 }
      );
    }

    // Token expiration time: 24 hours from now
    const expirationTimeInSeconds = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
    
    // Generate token with Publisher role (can send and receive audio)
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      0, // Use 0 for string user IDs
      RtcRole.PUBLISHER,
      expirationTimeInSeconds
    );

    return NextResponse.json({
      token,
      appId,
      channelName,
      userId,
      expiresAt: expirationTimeInSeconds
    });

  } catch (error) {
    console.error('Error generating Agora token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}