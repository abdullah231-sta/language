// app/api/groups/[groupId]/emoji-reactions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const body = await request.json();
    const { userId, emoji, seatPosition } = body;

    console.log('POST /api/groups/[groupId]/emoji-reactions called:', {
      groupId,
      userId,
      emoji,
      seatPosition
    });

    // Validate required fields
    if (!userId || !emoji || seatPosition === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: userId, emoji, seatPosition'
        },
        { status: 400 }
      );
    }

    // Validate emoji (should be a single emoji character)
    if (emoji.length !== 1 && emoji.length !== 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid emoji format'
        },
        { status: 400 }
      );
    }

    // Validate seat position
    if (seatPosition < 0 || seatPosition > 9) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid seat position. Must be between 0 and 9'
        },
        { status: 400 }
      );
    }

    // Check if the user is a member of the group and has a seat
    const { data: member, error: memberError } = await supabase
      .from('group_members')
      .select('id, seatPosition, role')
      .eq('groupId', groupId)
      .eq('userId', userId)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        {
          success: false,
          error: 'You are not a member of this group'
        },
        { status: 403 }
      );
    }

    // Check if the user has the correct seat position
    if (member.seatPosition !== seatPosition) {
      return NextResponse.json(
        {
          success: false,
          error: 'Seat position mismatch'
        },
        { status: 400 }
      );
    }

    // Store the emoji reaction in the database (optional - for persistence)
    // You could create a separate table for emoji reactions if needed
    // For now, we'll just validate and return success

    console.log(`Emoji reaction recorded: ${emoji} from user ${userId} at seat ${seatPosition} in group ${groupId}`);

    return NextResponse.json({
      success: true,
      message: 'Emoji reaction recorded',
      data: {
        userId,
        emoji,
        seatPosition,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('Emoji reaction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record emoji reaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}