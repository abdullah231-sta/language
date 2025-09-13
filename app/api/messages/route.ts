import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/messages called');
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!groupId && !conversationId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Either groupId or conversationId is required' 
        },
        { status: 400 }
      );
    }

    let query = supabase
      .from('messages')
      .select(`
        id,
        content,
        senderId,
        groupId,
        conversationId,
        createdAt,
        users!messages_senderId_fkey(username, email)
      `)
      .order('createdAt', { ascending: true })
      .range(offset, offset + limit - 1);

    if (groupId) {
      query = query.eq('groupId', groupId);
    } else if (conversationId) {
      query = query.eq('conversationId', conversationId);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      count: messages?.length || 0,
      messages: messages || [],
      message: `Found ${messages?.length || 0} messages`
    });

  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch messages',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/messages called');
    const body = await request.json();
    console.log('Send message request:', { ...body, content: body.content?.substring(0, 50) + '...' });
    
    const { content, senderId, groupId, conversationId } = body;

    // Validate required fields
    if (!content || !senderId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: content, senderId' 
        },
        { status: 400 }
      );
    }

    if (!groupId && !conversationId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Either groupId or conversationId is required' 
        },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Message content cannot be empty' 
        },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Message content cannot exceed 1000 characters' 
        },
        { status: 400 }
      );
    }

    // Validate that the sender exists
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', senderId)
      .single();

    if (senderError || !sender) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid sender ID' 
        },
        { status: 400 }
      );
    }

    // If sending to a group, validate group membership
    if (groupId) {
      const { data: membership, error: memberError } = await supabase
        .from('group_members')
        .select('id')
        .eq('userId', senderId)
        .eq('groupId', groupId)
        .single();

      if (memberError || !membership) {
        return NextResponse.json(
          { 
            success: false,
            error: 'User is not a member of this group' 
          },
          { status: 403 }
        );
      }

      // Validate that the group exists and is active
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('id, name, isActive')
        .eq('id', groupId)
        .single();

      if (groupError || !group || !group.isActive) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Group not found or inactive' 
          },
          { status: 400 }
        );
      }
    }

    console.log(`Sending message from ${sender.username}`);

    // Create the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        content: content.trim(),
        senderId: senderId,
        groupId: groupId || null,
        conversationId: conversationId || null,
        createdAt: new Date().toISOString()
      })
      .select(`
        id,
        content,
        senderId,
        groupId,
        conversationId,
        createdAt,
        users!messages_senderId_fkey(username, email)
      `)
      .single();

    if (messageError) {
      console.error('Message creation error:', messageError);
      throw messageError;
    }

    console.log('Message sent successfully:', message.id);

    return NextResponse.json({
      success: true,
      message: message,
      response: 'Message sent successfully!'
    }, { status: 201 });

  } catch (error) {
    console.error('Message sending error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}