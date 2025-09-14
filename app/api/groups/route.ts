import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/groups called');
    
    // Get user ID from headers to check membership
    const userId = request.headers.get('User-ID');
    console.log('Requesting user ID:', userId);
    
    // Get all active groups with their owners and member counts
    const { data: groups, error } = await supabase
      .from('groups')
      .select(`
        id,
        name,
        language,
        description,
        ownerId,
        isActive,
        createdAt,
        updatedAt,
        users!groups_ownerId_fkey(username, email, nationality),
        group_members(count),
        _count:group_members(count)
      `)
      .eq('isActive', true)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // If user ID is provided, check membership for each group
    let groupsWithMembership = groups || [];
    
    if (userId && groups) {
      // Get user's memberships in all groups
      const { data: memberships, error: membershipError } = await supabase
        .from('group_members')
        .select('groupId')
        .eq('userId', userId);

      if (!membershipError && memberships) {
        const memberGroupIds = new Set(memberships.map(m => m.groupId));
        
        groupsWithMembership = groups.map(group => ({
          ...group,
          isJoined: memberGroupIds.has(group.id),
          memberCount: group.group_members?.length || 0
        }));
      }
    }

    return NextResponse.json({
      success: true,
      count: groupsWithMembership?.length || 0,
      groups: groupsWithMembership || [],
      message: `Found ${groupsWithMembership?.length || 0} active groups`
    });

  } catch (error) {
    console.error('Groups fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch groups',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/groups called');
    const body = await request.json();
    console.log('Create group request:', body);
    
    const { name, language, description, ownerId } = body;

    // Validate required fields
    if (!name || !language || !ownerId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: name, language, ownerId' 
        },
        { status: 400 }
      );
    }

    // Validate that the owner exists (or create demo user if needed)
    let owner = null;
    const isDemoUser = ownerId.startsWith('demo-user-');
    
    if (isDemoUser) {
      // For demo users, check if they exist in database, if not create them
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, username')
        .eq('id', ownerId)
        .single();

      if (existingUser) {
        owner = existingUser;
      } else {
        // Create demo user in database
        const demoUserData = ownerId === 'demo-user-1' 
          ? {
              id: ownerId,
              email: 'demo@example.com',
              username: 'demo_user',
              nationality: 'US',
              nativeLanguage: 'English',
              targetLanguage: 'Spanish'
            }
          : {
              id: ownerId,
              email: 'learner@example.com', 
              username: 'language_learner',
              nationality: 'ES',
              nativeLanguage: 'Spanish',
              targetLanguage: 'English'
            };

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert(demoUserData)
          .select('id, username')
          .single();

        if (createError) {
          console.error('Error creating demo user:', createError);
          return NextResponse.json(
            { 
              success: false,
              error: 'Failed to create demo user' 
            },
            { status: 500 }
          );
        }

        owner = newUser;
      }
      
      console.log('Using demo user:', owner.username);
    } else {
      // For real users, validate they exist in the database
      const { data: dbOwner, error: ownerError } = await supabase
        .from('users')
        .select('id, username')
        .eq('id', ownerId)
        .single();

      if (ownerError || !dbOwner) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid owner ID' 
          },
          { status: 400 }
        );
      }
      
      owner = dbOwner;
    }

    console.log('Creating group for owner:', owner.username);

    // Create the group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: name.trim(),
        language: language.trim(),
        description: description?.trim() || null,
        ownerId: ownerId,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select('*')
      .single();

    if (groupError) {
      console.error('Group creation error:', groupError);
      throw groupError;
    }

    console.log('Group created:', group);

    // Add the owner as the first member with Section 1 seat
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        userId: ownerId,
        groupId: group.id,
        role: 'OWNER',
        seatPosition: 0, // Section 1 (position 0)
        isAdmin: true,
        joinedAt: new Date().toISOString()
      });

    if (memberError) {
      console.error('Error adding owner as member:', memberError);
      // Group was created but owner membership failed - this is non-critical
    }

    return NextResponse.json({
      success: true,
      group: group,
      message: `Group "${group.name}" created successfully!`
    }, { status: 201 });

  } catch (error) {
    console.error('Group creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create group',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE /api/groups called');
    const body = await request.json();
    console.log('Delete group request:', body);
    
    const { groupId, ownerId } = body;

    // Validate required fields
    if (!groupId || !ownerId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: groupId, ownerId' 
        },
        { status: 400 }
      );
    }

    // Verify that the requester is the group owner
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, ownerId, name')
      .eq('id', groupId)
      .eq('ownerId', ownerId)
      .single();

    if (groupError || !group) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Group not found or you are not the owner' 
        },
        { status: 403 }
      );
    }

    // Delete all group members first (due to foreign key constraints)
    const { error: membersError } = await supabase
      .from('group_members')
      .delete()
      .eq('groupId', groupId);

    if (membersError) {
      console.error('Error deleting group members:', membersError);
      // Continue anyway, as this might not be critical
    }

    // Delete all messages in the group
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('groupId', groupId);

    if (messagesError) {
      console.error('Error deleting group messages:', messagesError);
      // Continue anyway
    }

    // Finally delete the group
    const { error: deleteError } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (deleteError) {
      console.error('Error deleting group:', deleteError);
      throw deleteError;
    }

    console.log('Group deleted successfully:', group.name);

    return NextResponse.json({
      success: true,
      message: `Group "${group.name}" has been permanently deleted.`
    });

  } catch (error) {
    console.error('Group deletion error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete group',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}