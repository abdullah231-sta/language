// Test script to add a listener to the group
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ejfuftfzooiuoqtyfkwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqZnVmdGZ6b29pdW9xdHlma3dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NTgzMTAsImV4cCI6MjA3MzMzNDMxMH0.LXeGPxCnSeFCB4Qx8MY3BArRIlNIzlzLWPVk8tXZANk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addTestListener() {
  try {
    const groupId = 'bbdf6122-0d41-429c-b312-08cea20fa8c7';
    
    console.log('Checking existing members...');
    
    // Check existing members
    const { data: existingMembers, error: membersError } = await supabase
      .from('group_members')
      .select('*')
      .eq('groupId', groupId);
    
    console.log('Existing members:', existingMembers);
    console.log('Members error:', membersError);
    
    // Check if demo-user-1 exists
    const { data: demoUser1, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', 'demo-user-1')
      .single();
    
    console.log('Demo user 1:', demoUser1);
    console.log('User error:', userError);
    
    if (demoUser1) {
      // Add demo-user-1 as a listener (no seat position)
      const { data: newMember, error: insertError } = await supabase
        .from('group_members')
        .upsert({
          groupId: groupId,
          userId: 'demo-user-1',
          role: 'LISTENER',
          seatPosition: null, // null means they're in waiting area
          isAdmin: false,
          isMuted: false
        }, {
          onConflict: 'groupId,userId',
          ignoreDuplicates: false
        })
        .select();
      
      console.log('Added listener:', newMember);
      console.log('Insert error:', insertError);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

addTestListener();