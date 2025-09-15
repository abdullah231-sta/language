import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { action, groupId, userId, targetUserId, seatPosition, role, requesterId } = body;

    // Validate required fields
    if (!action || !groupId || !requesterId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: action, groupId, requesterId' 
        },
        { status: 400 }
      );
    }

    // Verify that the group exists and is active
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name, ownerId, isActive')
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
          error: 'Cannot perform actions on inactive group' 
        },
        { status: 400 }
      );
    }

    // Verify requester's permissions
    const { data: requesterMember, error: requesterError } = await supabase
      .from('group_members')
      .select('role, isAdmin')
      .eq('userId', requesterId)
      .eq('groupId', groupId)
      .single();

    if (requesterError || !requesterMember) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Requester is not a member of this group' 
        },
        { status: 403 }
      );
    }

    const isOwner = group.ownerId === requesterId;
    const isAdmin = requesterMember.isAdmin || isOwner;

    // Handle different actions
    switch (action) {
      case 'kick_user':
        return await handleKickUser(groupId, targetUserId, isOwner, isAdmin);
        
      case 'promote_user':
        return await handlePromoteUser(groupId, targetUserId, seatPosition, isOwner, isAdmin);
        
      case 'demote_user':
        return await handleDemoteUser(groupId, targetUserId, isOwner, isAdmin);
        
      case 'move_to_seat':
        return await handleMoveToSeat(groupId, targetUserId, seatPosition, isOwner, isAdmin);
        
      case 'move_to_waiting':
        return await handleMoveToWaiting(groupId, targetUserId, isOwner, isAdmin);
        
      case 'grant_admin':
        return await handleGrantAdmin(groupId, targetUserId, isOwner);
        
      case 'revoke_admin':
        return await handleRevokeAdmin(groupId, targetUserId, isOwner);
        
      case 'request_seat':
        return await handleRequestSeat(groupId, targetUserId, seatPosition);
        
      case 'accept_join_request':
        return await handleAcceptJoinRequest(groupId, targetUserId, seatPosition, isOwner, isAdmin);
        
      case 'reject_join_request':
        return await handleRejectJoinRequest(groupId, targetUserId, isOwner, isAdmin);

      default:
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid action' 
          },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Group action error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform group action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Kick user from group
async function handleKickUser(groupId: string, targetUserId: string, isOwner: boolean, isAdmin: boolean) {
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions to kick users' },
      { status: 403 }
    );
  }

  // Cannot kick the owner
  const { data: targetMember } = await supabase
    .from('group_members')
    .select('role')
    .eq('userId', targetUserId)
    .eq('groupId', groupId)
    .single();

  if (targetMember?.role === 'OWNER') {
    return NextResponse.json(
      { success: false, error: 'Cannot kick the group owner' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('userId', targetUserId)
    .eq('groupId', groupId);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    message: 'User has been kicked from the group'
  });
}

// Promote user to participant (give them a seat)
async function handlePromoteUser(groupId: string, targetUserId: string, seatPosition: number, isOwner: boolean, isAdmin: boolean) {
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions to promote users' },
      { status: 403 }
    );
  }

  if (seatPosition < 0 || seatPosition > 9) {
    return NextResponse.json(
      { success: false, error: 'Invalid seat position' },
      { status: 400 }
    );
  }

  // Check if seat is available
  const { data: existingSeat } = await supabase
    .from('group_members')
    .select('userId')
    .eq('groupId', groupId)
    .eq('seatPosition', seatPosition)
    .single();

  if (existingSeat) {
    return NextResponse.json(
      { success: false, error: 'Seat is already occupied' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('group_members')
    .update({
      role: 'PARTICIPANT',
      seatPosition: seatPosition
    })
    .eq('userId', targetUserId)
    .eq('groupId', groupId);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    message: `User has been promoted to Section ${seatPosition + 1}`
  });
}

// Demote user to listener (remove from seat)
async function handleDemoteUser(groupId: string, targetUserId: string, isOwner: boolean, isAdmin: boolean) {
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions to demote users' },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from('group_members')
    .update({
      role: 'LISTENER',
      seatPosition: null
    })
    .eq('userId', targetUserId)
    .eq('groupId', groupId);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    message: 'User has been moved to the waiting area'
  });
}

// Move user to specific seat
async function handleMoveToSeat(groupId: string, targetUserId: string, seatPosition: number, isOwner: boolean, isAdmin: boolean) {
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions to move users' },
      { status: 403 }
    );
  }

  if (seatPosition < 0 || seatPosition > 9) {
    return NextResponse.json(
      { success: false, error: 'Invalid seat position' },
      { status: 400 }
    );
  }

  // Check if seat is available
  const { data: existingSeat } = await supabase
    .from('group_members')
    .select('userId')
    .eq('groupId', groupId)
    .eq('seatPosition', seatPosition)
    .single();

  if (existingSeat && existingSeat.userId !== targetUserId) {
    return NextResponse.json(
      { success: false, error: 'Seat is already occupied' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('group_members')
    .update({
      seatPosition: seatPosition,
      role: 'PARTICIPANT'
    })
    .eq('userId', targetUserId)
    .eq('groupId', groupId);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    message: `User has been moved to Section ${seatPosition + 1}`
  });
}

// Move user to waiting area
async function handleMoveToWaiting(groupId: string, targetUserId: string, isOwner: boolean, isAdmin: boolean) {
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions to move users' },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from('group_members')
    .update({
      seatPosition: null,
      role: 'LISTENER'
    })
    .eq('userId', targetUserId)
    .eq('groupId', groupId);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    message: 'User has been moved to the waiting area'
  });
}

// Grant admin privileges
async function handleGrantAdmin(groupId: string, targetUserId: string, isOwner: boolean) {
  if (!isOwner) {
    return NextResponse.json(
      { success: false, error: 'Only the group owner can grant admin privileges' },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from('group_members')
    .update({ isAdmin: true })
    .eq('userId', targetUserId)
    .eq('groupId', groupId);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    message: 'Admin privileges have been granted'
  });
}

// Revoke admin privileges
async function handleRevokeAdmin(groupId: string, targetUserId: string, isOwner: boolean) {
  if (!isOwner) {
    return NextResponse.json(
      { success: false, error: 'Only the group owner can revoke admin privileges' },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from('group_members')
    .update({ isAdmin: false })
    .eq('userId', targetUserId)
    .eq('groupId', groupId);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    message: 'Admin privileges have been revoked'
  });
}

// Request a seat
async function handleRequestSeat(groupId: string, userId: string, seatPosition: number) {
  // Check if seat is available
  const { data: existingSeat } = await supabase
    .from('group_members')
    .select('userId')
    .eq('groupId', groupId)
    .eq('seatPosition', seatPosition)
    .single();

  if (existingSeat) {
    return NextResponse.json(
      { success: false, error: 'Seat is already occupied' },
      { status: 400 }
    );
  }

  // Update user to mark them as requesting this seat (temporarily use a negative number to indicate request)
  const requestMarker = -(seatPosition + 1); // -1 for seat 0, -2 for seat 1, etc.
  
  const { error } = await supabase
    .from('group_members')
    .update({ seatPosition: requestMarker })
    .eq('userId', userId)
    .eq('groupId', groupId);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    message: 'Seat request submitted'
  });
}

// Accept join request
async function handleAcceptJoinRequest(groupId: string, targetUserId: string, seatPosition: number, isOwner: boolean, isAdmin: boolean) {
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions to accept requests' },
      { status: 403 }
    );
  }

  // Check if seat is still available
  const { data: existingSeat } = await supabase
    .from('group_members')
    .select('userId')
    .eq('groupId', groupId)
    .eq('seatPosition', seatPosition)
    .single();

  if (existingSeat) {
    return NextResponse.json(
      { success: false, error: 'Seat is no longer available' },
      { status: 400 }
    );
  }

  // Assign the user to the seat and change role to PARTICIPANT
  const { error } = await supabase
    .from('group_members')
    .update({
      seatPosition: seatPosition,
      role: 'PARTICIPANT'
    })
    .eq('userId', targetUserId)
    .eq('groupId', groupId);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    message: `User assigned to Section ${seatPosition + 1}`
  });
}

// Reject join request
async function handleRejectJoinRequest(groupId: string, targetUserId: string, isOwner: boolean, isAdmin: boolean) {
  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions to reject requests' },
      { status: 403 }
    );
  }

  // Reset user to waiting area (LISTENER with null seatPosition)
  const { error } = await supabase
    .from('group_members')
    .update({
      seatPosition: null,
      role: 'LISTENER'
    })
    .eq('userId', targetUserId)
    .eq('groupId', groupId);

  if (error) throw error;

  return NextResponse.json({
    success: true,
    message: 'Join request rejected'
  });
}