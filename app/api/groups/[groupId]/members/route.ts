import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    console.log('GET /api/groups/[groupId]/members called for group:', groupId);

    // Get group with owner info
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select(`
        id,
        name,
        language,
        description,
        ownerId,
        isActive,
        createdAt,
        users(id, username, email, nationality, nativeLanguage, targetLanguage)
      `)
      .eq('id', groupId)
      .eq('isActive', true)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Group not found or inactive' 
        },
        { status: 404 }
      );
    }

    // Get all group members with their details and roles
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select(`
        id,
        userId,
        role,
        seatPosition,
        isAdmin,
        isMuted,
        joinedAt,
        users(id, username, email, nationality, nativeLanguage, targetLanguage)
      `)
      .eq('groupId', groupId)
      .order('seatPosition', { ascending: true })
      .order('joinedAt', { ascending: true });

    if (membersError) {
      console.error('Error fetching group members:', membersError);
      throw membersError;
    }

    // Process members into the format expected by frontend
    const tableSeats: any[] = Array(10).fill(null).map((_, position) => ({
      position,
      user: null
    }));

    const waitingUsers: any[] = [];

    if (members) {
      for (const member of members) {
        const user = Array.isArray(member.users) ? member.users[0] : member.users;
        const userInfo = {
          id: user.id,
          name: user.username,
          avatarUrl: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&u=${user.id}`,
          isMuted: member.isMuted || false,
          isOwner: member.role === 'OWNER',
          isAdmin: member.isAdmin,
          nationality: user.nationality || 'US',
          nativeLanguage: user.nativeLanguage || 'English',
          targetLanguage: user.targetLanguage || 'Spanish',
          role: member.role,
          joinedAt: member.joinedAt
        };

        if (member.seatPosition !== null && member.seatPosition >= 0 && member.seatPosition < 10) {
          // User has a table seat
          tableSeats[member.seatPosition] = {
            position: member.seatPosition,
            user: userInfo
          };
        } else {
          // User is in waiting area (LISTENER role) or has made a request
          const hasRequested = member.seatPosition !== null && member.seatPosition < 0;
          const requestedSeatPosition = hasRequested ? Math.abs(member.seatPosition) - 1 : undefined;
          
          waitingUsers.push({
            id: user.id,
            name: user.username,
            avatarUrl: userInfo.avatarUrl,
            requestedAt: new Date(member.joinedAt),
            nationality: user.nationality || 'US',
            nativeLanguage: user.nativeLanguage || 'English',
            targetLanguage: user.targetLanguage || 'Spanish',
            role: member.role,
            hasRequested: hasRequested,
            requestedSeatPosition: requestedSeatPosition
          });
        }
      }
    }

    const groupOwner = Array.isArray(group.users) ? group.users[0] : group.users;

    const response = {
      success: true,
      group: {
        id: group.id,
        name: group.name,
        language: group.language,
        description: group.description,
        owner: {
          id: groupOwner.id,
          name: groupOwner.username,
          avatarUrl: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&u=${groupOwner.id}`,
          nationality: groupOwner.nationality || 'US',
          nativeLanguage: groupOwner.nativeLanguage || 'English',
          targetLanguage: groupOwner.targetLanguage || 'Spanish'
        },
        tableSeats,
        waitingUsers,
        memberCount: members?.length || 0
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Group members fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch group members',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}