import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/groups/join called');
    const body = await request.json();
    console.log('Join group request:', body);
    
    const { userId, groupId, action } = body;

    // Validate required fields
    if (!userId || !groupId || !action) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: userId, groupId, action' 
        },
        { status: 400 }
      );
    }

    if (!['join', 'leave'].includes(action)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid action. Must be "join" or "leave"' 
        },
        { status: 400 }
      );
    }

    // Validate that the user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid user ID' 
        },
        { status: 400 }
      );
    }

    // Validate that the group exists and is active
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name, isActive')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid group ID' 
        },
        { status: 400 }
      );
    }

    if (!group.isActive) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Cannot join inactive group' 
        },
        { status: 400 }
      );
    }

    if (action === 'join') {
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('userId', userId)
        .eq('groupId', groupId)
        .single();

      if (existingMember) {
        return NextResponse.json(
          { 
            success: false,
            error: 'User is already a member of this group' 
          },
          { status: 409 }
        );
      }

      // Add user to group
      const { data: membership, error: joinError } = await supabase
        .from('group_members')
        .insert({
          userId: userId,
          groupId: groupId,
          role: 'PARTICIPANT',
          isAdmin: false,
          joinedAt: new Date().toISOString()
        })
        .select('*')
        .single();

      if (joinError) {
        console.error('Join group error:', joinError);
        throw joinError;
      }

      console.log(`User ${user.username} joined group ${group.name}`);
      
      return NextResponse.json({
        success: true,
        membership: membership,
        message: `Successfully joined group "${group.name}"`
      });

    } else if (action === 'leave') {
      // Check if user is a member
      const { data: membership, error: memberError } = await supabase
        .from('group_members')
        .select('id, role')
        .eq('userId', userId)
        .eq('groupId', groupId)
        .single();

      if (memberError || !membership) {
        return NextResponse.json(
          { 
            success: false,
            error: 'User is not a member of this group' 
          },
          { status: 404 }
        );
      }

      // Don't allow owner to leave their own group
      if (membership.role === 'OWNER') {
        return NextResponse.json(
          { 
            success: false,
            error: 'Group owner cannot leave the group. Transfer ownership or delete the group instead.' 
          },
          { status: 400 }
        );
      }

      // Remove user from group
      const { error: leaveError } = await supabase
        .from('group_members')
        .delete()
        .eq('id', membership.id);

      if (leaveError) {
        console.error('Leave group error:', leaveError);
        throw leaveError;
      }

      console.log(`User ${user.username} left group ${group.name}`);
      
      return NextResponse.json({
        success: true,
        message: `Successfully left group "${group.name}"`
      });
    }

  } catch (error) {
    console.error('Group membership error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update group membership',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}