import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { userId, groupId, action = 'join' } = body;

    // Validate required fields
    if (!userId || !groupId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: userId, groupId' 
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

    // Validate that the user exists (or is a demo user)
    let user;
    if (userId.startsWith('demo-user-')) {
      // Handle demo users
      const demoUserMap = {
        'demo-user-1': { id: 'demo-user-1', username: 'demo_user' },
        'demo-user-2': { id: 'demo-user-2', username: 'language_learner' }
      };
      
      user = demoUserMap[userId as keyof typeof demoUserMap];
      if (!user) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid demo user ID' 
          },
          { status: 400 }
        );
      }
      
      // Ensure demo user exists in database
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (checkError || !existingUser) {
        // Create demo user in database
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            username: user.username,
            email: userId === 'demo-user-1' ? 'demo@example.com' : 'learner@example.com',
            nationality: userId === 'demo-user-1' ? 'US' : 'ES',
            nativeLanguage: userId === 'demo-user-1' ? 'English' : 'Spanish',
            targetLanguage: userId === 'demo-user-1' ? 'Spanish' : 'English'
          });
          
        if (createError) {
          console.error('Failed to create demo user:', createError);
          // Continue anyway, as user might already exist
        }
      }
    } else {
      // For real users, validate they exist in the database
      const { data: dbUser, error: userError } = await supabase
        .from('users')
        .select('id, username')
        .eq('id', userId)
        .single();

      if (userError || !dbUser) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid user ID' 
          },
          { status: 400 }
        );
      }
      
      user = dbUser;
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

      // Add user to group as listener (waiting area)
      const { data: membership, error: joinError } = await supabase
        .from('group_members')
        .insert({
          userId: userId,
          groupId: groupId,
          role: 'LISTENER',
          seatPosition: null, // No seat assigned yet - in waiting area
          isAdmin: false,
          joinedAt: new Date().toISOString()
        })
        .select('*')
        .single();

      if (joinError) {
        console.error('Join group error:', joinError);
        throw joinError;
      }
      
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