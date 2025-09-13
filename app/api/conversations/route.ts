import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/conversations called');
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'userId parameter is required' 
        },
        { status: 400 }
      );
    }

    // Get all conversations for the user
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        userId,
        participantId,
        createdAt,
        updatedAt,
        participant:users!conversations_participantId_fkey(id, username, email),
        messages(
          id,
          content,
          senderId,
          createdAt
        )
      `)
      .eq('userId', userId)
      .order('updatedAt', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      count: conversations?.length || 0,
      conversations: conversations || [],
      message: `Found ${conversations?.length || 0} conversations`
    });

  } catch (error) {
    console.error('Conversations fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch conversations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/conversations called');
    const body = await request.json();
    console.log('Create conversation request:', body);
    
    const { userId, participantId } = body;

    // Validate required fields
    if (!userId || !participantId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: userId, participantId' 
        },
        { status: 400 }
      );
    }

    if (userId === participantId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Cannot create conversation with yourself' 
        },
        { status: 400 }
      );
    }

    // Validate that both users exist
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username')
      .in('id', [userId, participantId]);

    if (usersError || !users || users.length !== 2) {
      return NextResponse.json(
        { 
          success: false,
          error: 'One or both user IDs are invalid' 
        },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(userId.eq.${userId},participantId.eq.${participantId}),and(userId.eq.${participantId},participantId.eq.${userId})`)
      .single();

    if (existingConversation) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Conversation already exists between these users' 
        },
        { status: 409 }
      );
    }

    console.log('Creating conversation between users');

    // Create the conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        userId: userId,
        participantId: participantId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select(`
        id,
        userId,
        participantId,
        createdAt,
        updatedAt,
        participant:users!conversations_participantId_fkey(id, username, email)
      `)
      .single();

    if (conversationError) {
      console.error('Conversation creation error:', conversationError);
      throw conversationError;
    }

    console.log('Conversation created successfully:', conversation.id);

    return NextResponse.json({
      success: true,
      conversation: conversation,
      message: 'Conversation created successfully!'
    }, { status: 201 });

  } catch (error) {
    console.error('Conversation creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create conversation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}