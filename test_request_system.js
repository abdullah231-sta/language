// Test script to verify the request system works
const fs = require('fs');

async function testRequestSystem() {
    const baseUrl = 'http://127.0.0.1:3000';
    
    console.log('🧪 Testing Request System...\n');
    
    // Step 1: Create a test group
    console.log('1. Creating test group...');
    let response = await fetch(`${baseUrl}/api/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test Request System',
            language: 'English',
            description: 'Testing cross-browser requests',
            ownerId: 'demo-user-1'
        })
    });
    
    if (!response.ok) {
        console.log('❌ Failed to create group');
        return;
    }
    
    const groupData = await response.json();
    const groupId = groupData.group.id;
    console.log(`✅ Created group: ${groupId}\n`);
    
    // Step 2: Join as listener (demo-user-2)
    console.log('2. Joining group as listener...');
    response = await fetch(`${baseUrl}/api/groups/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            groupId: groupId,
            userId: 'demo-user-2',
            action: 'join'
        })
    });
    
    if (!response.ok) {
        console.log('❌ Failed to join group');
        return;
    }
    console.log('✅ Joined group as listener\n');
    
    // Step 3: Check initial member status
    console.log('3. Checking initial member status...');
    response = await fetch(`${baseUrl}/api/groups/${groupId}/members`);
    const initialData = await response.json();
    
    if (initialData.success) {
        console.log(`📊 Initial waiting users: ${initialData.group.waitingUsers.length}`);
        initialData.group.waitingUsers.forEach(user => {
            console.log(`   - ${user.name}: hasRequested=${user.hasRequested || false}`);
        });
    }
    console.log();
    
    // Step 4: Make a seat request
    console.log('4. Making seat request...');
    response = await fetch(`${baseUrl}/api/groups/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'request_seat',
            groupId: groupId,
            targetUserId: 'demo-user-2',
            requesterId: 'demo-user-2',
            seatPosition: 0
        })
    });
    
    if (!response.ok) {
        console.log('❌ Failed to make seat request');
        const errorText = await response.text();
        console.log('Error:', errorText);
        return;
    }
    
    const requestResult = await response.json();
    console.log('✅ Seat request result:', requestResult.message || 'Success');
    console.log();
    
    // Step 5: Check member status after request
    console.log('5. Checking member status after request...');
    response = await fetch(`${baseUrl}/api/groups/${groupId}/members`);
    const afterData = await response.json();
    
    if (afterData.success) {
        console.log(`📊 After request - waiting users: ${afterData.group.waitingUsers.length}`);
        afterData.group.waitingUsers.forEach(user => {
            console.log(`   - ${user.name}: hasRequested=${user.hasRequested || false}, requestedSeat=${user.requestedSeatPosition}`);
        });
        
        // Check if any user has hasRequested=true
        const hasActiveRequests = afterData.group.waitingUsers.some(user => user.hasRequested);
        console.log(`🎯 Active requests detected: ${hasActiveRequests ? 'YES' : 'NO'}`);
        
        if (hasActiveRequests) {
            console.log('✅ SUCCESS: Request system is working!');
        } else {
            console.log('❌ FAILED: No requests detected');
        }
    }
}

testRequestSystem().catch(console.error);