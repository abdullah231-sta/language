import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Manual migration instructions...');
    
    const sqlCommands = [
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;`
    ];

    return NextResponse.json({
      success: true,
      message: 'Please run these SQL commands in your Supabase SQL Editor:',
      commands: sqlCommands,
      instructions: [
        '1. Go to your Supabase dashboard',
        '2. Navigate to SQL Editor',
        '3. Run each command above',
        '4. Then test user creation again'
      ]
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}