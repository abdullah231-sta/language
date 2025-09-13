import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/auth/logout called');
    
    // For now, logout is handled client-side by clearing local storage
    // In a production app, we might invalidate server-side sessions here
    
    return NextResponse.json({
      success: true,
      message: 'Logout successful!'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Logout failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}