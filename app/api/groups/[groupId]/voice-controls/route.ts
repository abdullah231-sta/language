// app/api/groups/[groupId]/voice-controls/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const body = await request.json();
    const { userId, action, targetUserId } = body;

    console.log('POST /api/groups/[groupId]/voice-controls called:', {
      groupId,
      userId,
      action,
      targetUserId
    });

    // Validate required fields
    if (!userId || !action || !targetUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: userId, action, targetUserId'
        },
        { status: 400 }
      );
    }

    // Validate action
    if (!['mute', 'unmute', 'deafen', 'undeafen'].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Must be: mute, unmute, deafen, undeafen'
        },
        { status: 400 }
      );
    }

    // Check if the user making the request is a member of the group
    const { data: requesterMember, error: requesterError } = await supabase
      .from('group_members')
      .select('role, isAdmin')
      .eq('groupId', groupId)
      .eq('userId', userId)
      .single();

    if (requesterError || !requesterMember) {
      return NextResponse.json(
        {
          success: false,
          error: 'You are not a member of this group'
        },
        { status: 403 }
      );
    }

    // Check if the target user is a member of the group
    const { data: targetMember, error: targetError } = await supabase
      .from('group_members')
      .select('id, role, isAdmin, isMuted')
      .eq('groupId', groupId)
      .eq('userId', targetUserId)
      .single();

    if (targetError || !targetMember) {
      return NextResponse.json(
        {
          success: false,
          error: 'Target user is not a member of this group'
        },
        { status: 404 }
      );
    }

    // Check permissions: only group owner/admin can control others
    // Users can control themselves
    if (userId !== targetUserId) {
      const isOwner = requesterMember.role === 'OWNER';
      const isAdmin = requesterMember.isAdmin;
      const targetIsOwner = targetMember.role === 'OWNER';

      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          {
            success: false,
            error: 'You do not have permission to control other users'
          },
          { status: 403 }
        );
      }

      if (targetIsOwner && !isOwner) {
        return NextResponse.json(
          {
            success: false,
            error: 'Only the group owner can control other owners'
          },
          { status: 403 }
        );
      }
    }

    // Update the voice control state
    let updateData: any = {};

    switch (action) {
      case 'mute':
        updateData.isMuted = true;
        break;
      case 'unmute':
        updateData.isMuted = false;
        break;
      case 'deafen':
        updateData.isDeafened = true;
        break;
      case 'undeafen':
        updateData.isDeafened = false;
        break;
    }

    const { error: updateError } = await supabase
      .from('group_members')
      .update(updateData)
      .eq('groupId', groupId)
      .eq('userId', targetUserId);

    if (updateError) {
      console.error('Error updating voice controls:', updateError);
      throw updateError;
    }

    console.log(`Voice control updated: ${action} for user ${targetUserId} in group ${groupId}`);

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}d user`,
      data: {
        userId: targetUserId,
        action,
        ...updateData
      }
    });

  } catch (error) {
    console.error('Voice controls error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update voice controls',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}