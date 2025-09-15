import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'messageId parameter is required' },
        { status: 400 }
      )
    }

    // Get all reactions for the message
    const { data: reactions, error } = await supabase
      .from('message_reactions')
      .select(`
        id,
        emoji,
        createdAt,
        user:users(id, username, avatarUrl)
      `)
      .eq('messageId', messageId)
      .order('createdAt', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    // Group reactions by emoji and count users
    const groupedReactions = reactions?.reduce((acc: any[], reaction: any) => {
      const existing = acc.find(r => r.emoji === reaction.emoji)
      if (existing) {
        existing.count++
        existing.users.push(reaction.user)
      } else {
        acc.push({
          emoji: reaction.emoji,
          count: 1,
          users: [reaction.user]
        })
      }
      return acc
    }, []) || []

    return NextResponse.json({
      success: true,
      reactions: groupedReactions,
      message: `Found ${groupedReactions.length} reaction types`
    })

  } catch (error) {
    console.error('Reactions fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reactions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, emoji, userId } = body

    // Validate required fields
    if (!messageId || !emoji || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: messageId, emoji, userId'
        },
        { status: 400 }
      )
    }

    // Check if user already reacted with this emoji
    const { data: existingReaction } = await supabase
      .from('message_reactions')
      .select('id')
      .eq('messageId', messageId)
      .eq('userId', userId)
      .eq('emoji', emoji)
      .single()

    if (existingReaction) {
      // Remove the reaction (toggle behavior)
      const { error: deleteError } = await supabase
        .from('message_reactions')
        .delete()
        .eq('id', existingReaction.id)

      if (deleteError) throw deleteError

      return NextResponse.json({
        success: true,
        action: 'removed',
        message: 'Reaction removed successfully'
      })
    } else {
      // Check if user already reacted with a different emoji
      const { data: userReactions } = await supabase
        .from('message_reactions')
        .select('id, emoji')
        .eq('messageId', messageId)
        .eq('userId', userId)

      // Remove existing reaction if any (one reaction per user)
      if (userReactions && userReactions.length > 0) {
        await supabase
          .from('message_reactions')
          .delete()
          .eq('messageId', messageId)
          .eq('userId', userId)
      }

      // Add new reaction
      const { data: newReaction, error } = await supabase
        .from('message_reactions')
        .insert({
          messageId,
          userId,
          emoji
        })
        .select(`
          id,
          emoji,
          createdAt,
          user:users(id, username, avatarUrl)
        `)
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        action: 'added',
        reaction: newReaction,
        message: 'Reaction added successfully'
      }, { status: 201 })
    }

  } catch (error) {
    console.error('Reaction error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process reaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')
    const userId = searchParams.get('userId')
    const emoji = searchParams.get('emoji')

    if (!messageId || !userId) {
      return NextResponse.json(
        { success: false, error: 'messageId and userId parameters are required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('message_reactions')
      .delete()
      .eq('messageId', messageId)
      .eq('userId', userId)

    if (emoji) {
      query = query.eq('emoji', emoji)
    }

    const { error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Reaction(s) removed successfully'
    })

  } catch (error) {
    console.error('Reaction deletion error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove reaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}