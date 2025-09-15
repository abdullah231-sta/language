import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')
    const userId = searchParams.get('userId')

    if (!messageId || !userId) {
      return NextResponse.json(
        { success: false, error: 'messageId and userId parameters are required' },
        { status: 400 }
      )
    }

    // Check if message is read by user
    const { data: readStatus, error } = await supabase
      .from('message_read_status')
      .select('readAt')
      .eq('messageId', messageId)
      .eq('userId', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return NextResponse.json({
      success: true,
      isRead: !!readStatus,
      readAt: readStatus?.readAt || null
    })

  } catch (error) {
    console.error('Read status check error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check read status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, userId } = body

    if (!messageId || !userId) {
      return NextResponse.json(
        { success: false, error: 'messageId and userId are required' },
        { status: 400 }
      )
    }

    // Check if read status already exists
    const { data: existingStatus } = await supabase
      .from('message_read_status')
      .select('id')
      .eq('messageId', messageId)
      .eq('userId', userId)
      .single()

    if (existingStatus) {
      return NextResponse.json({
        success: true,
        message: 'Message already marked as read'
      })
    }

    // Mark message as read
    const { data: readStatus, error } = await supabase
      .from('message_read_status')
      .insert({
        messageId,
        userId
      })
      .select('id, readAt')
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      readStatus: readStatus,
      message: 'Message marked as read'
    }, { status: 201 })

  } catch (error) {
    console.error('Mark as read error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to mark message as read',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET_UNREAD(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const conversationId = searchParams.get('conversationId')
    const groupId = searchParams.get('groupId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId parameter is required' },
        { status: 400 }
      )
    }

    if (!conversationId && !groupId) {
      return NextResponse.json(
        { success: false, error: 'Either conversationId or groupId is required' },
        { status: 400 }
      )
    }

    // Get unread messages count
    let query = supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('isDeleted', false)
      .neq('senderId', userId) // Exclude user's own messages

    if (conversationId) {
      query = query.eq('conversationId', conversationId)
    } else if (groupId) {
      query = query.eq('groupId', groupId)
    }

    // Left join with read status to find unread messages
    const { data: messages, error, count } = await query

    if (error) throw error

    // Get read message IDs for this user
    const { data: readStatuses } = await supabase
      .from('message_read_status')
      .select('messageId')
      .eq('userId', userId)

    const readMessageIds = new Set(readStatuses?.map(rs => rs.messageId) || [])
    const unreadCount = messages?.filter(msg => !readMessageIds.has(msg.id)).length || 0

    return NextResponse.json({
      success: true,
      unreadCount: unreadCount,
      totalMessages: count || 0
    })

  } catch (error) {
    console.error('Unread count error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get unread count',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}