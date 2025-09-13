import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/auth/login called');
    const body = await request.json()
    console.log('Login request body:', { ...body, password: '[HIDDEN]' });
    
    const { emailOrUsername, password } = body

    // Validate required fields
    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email/username and password are required' 
        },
        { status: 400 }
      );
    }

    console.log('Looking up user...');
    
    // Find user by email or username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, username, avatarUrl, nationality, nativeLanguage, targetLanguage, createdAt')
      .or(`email.eq.${emailOrUsername.toLowerCase()},username.eq.${emailOrUsername.toLowerCase()}`)
      .maybeSingle();

    if (userError) {
      console.error('Database error:', userError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Database error during login' 
        },
        { status: 500 }
      );
    }

    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid credentials' 
        },
        { status: 401 }
      );
    }

    console.log('User found, verifying password...');
    console.log('User data:', { ...user, avatarUrl: user.avatarUrl ? '[HASH_EXISTS]' : '[NO_HASH]' });
    
    // Verify password (currently stored in avatarUrl field)
    const passwordHash = user.avatarUrl;
    if (!passwordHash) {
      console.log('No password hash found for user - this user may have been created before password hashing was implemented');
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid credentials' 
        },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, passwordHash);
    
    if (!isValidPassword) {
      console.log('Invalid password');
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid credentials' 
        },
        { status: 401 }
      );
    }

    console.log('Login successful for user:', user.username);
    
    // Remove sensitive data before sending response
    const { avatarUrl, ...userResponse } = user;

    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Login failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}