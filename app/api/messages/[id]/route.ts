import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('id')

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      )
    }

    const { data: message, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        senderId,
        groupId,
        conversationId,
        createdAt,
        updatedAt,
        isEdited,
        isDeleted,
        sender:users(id, username, avatarUrl)
      `)
      .eq('id', messageId)
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: message
    })

  } catch (error) {
    console.error('Message fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('id')

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { content, userId } = body

    if (!content || !userId) {
      return NextResponse.json(
        { success: false, error: 'Content and userId are required' },
        { status: 400 }
      )
    }

    // Get the message to check ownership
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('senderId, isDeleted')
      .eq('id', messageId)
      .single()

    if (fetchError) throw fetchError

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      )
    }

    if (message.isDeleted) {
      return NextResponse.json(
        { success: false, error: 'Cannot edit deleted message' },
        { status: 400 }
      )
    }

    // Check if user owns the message
    if (message.senderId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own messages' },
        { status: 403 }
      )
    }

    // Update the message
    const { data: updatedMessage, error: updateError } = await supabase
      .from('messages')
      .update({
        content: content.trim(),
        isEdited: true,
        updatedAt: new Date().toISOString()
      })
      .eq('id', messageId)
      .select(`
        id,
        content,
        senderId,
        groupId,
        conversationId,
        createdAt,
        updatedAt,
        isEdited,
        sender:users(id, username, avatarUrl)
      `)
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: updatedMessage,
      response: 'Message updated successfully'
    })

  } catch (error) {
    console.error('Message update error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!messageId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Message ID and userId are required' },
        { status: 400 }
      )
    }

    // Get the message to check ownership
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('senderId, isDeleted')
      .eq('id', messageId)
      .single()

    if (fetchError) throw fetchError

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      )
    }

    if (message.isDeleted) {
      return NextResponse.json(
        { success: false, error: 'Message already deleted' },
        { status: 400 }
      )
    }

    // Check if user owns the message
    if (message.senderId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own messages' },
        { status: 403 }
      )
    }

    // Soft delete the message
    const { error: deleteError } = await supabase
      .from('messages')
      .update({
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        content: '[Message deleted]'
      })
      .eq('id', messageId)

    if (deleteError) throw deleteError

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    })

  } catch (error) {
    console.error('Message deletion error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}