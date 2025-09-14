// Add another test listener with a join request
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ejfuftfzooiuoqtyfkwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqZnVmdGZ6b29pdW9xdHlma3dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NTgzMTAsImV4cCI6MjA3MzMzNDMxMH0.LXeGPxCnSeFCB4Qx8MY3BArRIlNIzlzLWPVk8tXZANk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addListenerWithRequest() {
  try {
    const groupId = 'bbdf6122-0d41-429c-b312-08cea20fa8c7';
    
    // Check if demo-user-3 exists, if not create one
    let { data: user3, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', 'demo-user-3')
      .single();
    
    if (!user3) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: 'demo-user-3',
          email: 'demo3@example.com',
          username: 'demo_user_3',
          nationality: 'UK',
          nativeLanguage: 'English',
          targetLanguage: 'French'
        })
        .select()
        .single();
      
      console.log('Created new user:', newUser);
      user3 = newUser;
    }
    
    console.log('Demo user 3:', user3);
    
    if (user3) {
      // Add demo-user-3 as a listener with a join request (negative seat position indicates request)
      const { data: newMember, error: insertError } = await supabase
        .from('group_members')
        .upsert({
          groupId: groupId,
          userId: 'demo-user-3',
          role: 'LISTENER',
          seatPosition: -2, // Negative position means requesting seat 1 (position 1)
          isAdmin: false,
          isMuted: false
        }, {
          onConflict: 'groupId,userId',
          ignoreDuplicates: false
        })
        .select();
      
      console.log('Added listener with request:', newMember);
      console.log('Insert error:', insertError);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

addListenerWithRequest();