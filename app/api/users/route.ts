// API route to get users and handle user registration
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CreateUserRequest {
  email: string;
  username: string;
  full_name: string;
  password: string;
}

interface UserResponse {
  id: string;
  username: string;
  email: string;
  full_name: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    // Test database connection using Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(5)

    if (error) {
      throw error
    }

    // Let's also check the table structure
    const sampleUser = users?.[0] || null;

    return NextResponse.json({
      success: true,
      count: users?.length || 0,
      users: users || [],
      message: `Database connected! Found ${users?.length || 0} users.`,
      sampleStructure: users?.[0] || null
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json()
    
    const { email, username, full_name, password } = body

    // Validate required fields
    if (!email || !username || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: email, username, password' 
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid email format' 
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Password must be at least 6 characters long' 
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email.toLowerCase()},username.eq.${username.toLowerCase()}`)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing user:', checkError);
    }

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          error: 'User with this email or username already exists' 
        },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase().trim(),
        username: username.toLowerCase().trim(),
        avatarUrl: hashedPassword, // Temporary storage for password hash
        nationality: 'US',
        nativeLanguage: 'English',
        targetLanguage: 'Spanish'
      })
      .select('id, email, username, nationality, nativeLanguage, targetLanguage, createdAt')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      user: user,
      message: 'User created successfully! (Password stored temporarily in avatarUrl field)'
    }, { status: 201 })
  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}