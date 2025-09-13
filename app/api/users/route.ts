// API route to get users and handle user registration
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    console.log('Sample user data structure:', users?.[0] || 'No users found');

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
    console.log('POST /api/users called');
    const body = await request.json()
    console.log('Request body:', body);
    
    const { email, username, full_name, password } = body

    // Validate required fields
    if (!email || !username || !password) {
      console.log('Missing required fields');
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
      console.log('Invalid email format:', email);
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
      console.log('Password too short');
      return NextResponse.json(
        { 
          success: false,
          error: 'Password must be at least 6 characters long' 
        },
        { status: 400 }
      );
    }

    console.log('Checking for existing user...');
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
      console.log('User already exists:', existingUser);
      return NextResponse.json(
        { 
          success: false,
          error: 'User with this email or username already exists' 
        },
        { status: 409 }
      );
    }

    console.log('Creating user with existing schema...');

    // Create a new user using Supabase with existing columns
    // We'll store a hash of the password in the avatarUrl field temporarily
    // This is not ideal but works with the current schema
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

    console.log('User created successfully:', user);
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