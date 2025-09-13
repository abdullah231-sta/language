import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/groups called');
    
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
        users!groups_ownerId_fkey(username, email),
        group_members(count)
      `)
      .eq('isActive', true)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      count: groups?.length || 0,
      groups: groups || [],
      message: `Found ${groups?.length || 0} active groups`
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

    // Validate that the owner exists
    const { data: owner, error: ownerError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', ownerId)
      .single();

    if (ownerError || !owner) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid owner ID' 
        },
        { status: 400 }
      );
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

    // Add the owner as the first member (admin role)
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        userId: ownerId,
        groupId: group.id,
        role: 'OWNER',
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