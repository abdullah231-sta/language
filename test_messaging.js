// Test script to verify messaging persistence between users
async function testMessagingPersistence() {
    const baseUrl = 'http://127.0.0.1:3000';

    console.log('🧪 Testing Messaging Persistence...\n');

    // Use real user IDs from the database
    const user1 = '185acadb-199b-4cfd-b674-547a1ff4277a'; // testuser_1757765283783
    const user2 = '4d40cf99-2e87-441a-bca7-b9e8a2fcbbcf'; // testuser_1757765972910

    // Step 1: Try to create a test conversation or use existing one
    console.log('1. Creating/finding test conversation...');
    let response = await fetch(`${baseUrl}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: user1,
            participantId: user2
        })
    });

    let conversationId;
    if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'Conversation already exists between these users') {
            // Find existing conversation
            console.log('   Conversation already exists, finding it...');
            const getResponse = await fetch(`${baseUrl}/api/conversations?userId=${user1}`);
            if (getResponse.ok) {
                const convData = await getResponse.json();
                const existingConv = convData.conversations?.find(c => c.participantId === user2);
                if (existingConv) {
                    conversationId = existingConv.id;
                    console.log(`✅ Found existing conversation: ${conversationId}\n`);
                } else {
                    console.log('❌ Could not find existing conversation');
                    return;
                }
            } else {
                console.log('❌ Failed to find existing conversation');
                return;
            }
        } else {
            console.log('❌ Failed to create conversation:', errorData.error);
            return;
        }
    } else {
        const convData = await response.json();
        conversationId = convData.conversation.id;
        console.log(`✅ Created conversation: ${conversationId}\n`);
    }

    // Step 2: Send a message from user-1
    console.log('2. Sending message from user-1...');
    response = await fetch(`${baseUrl}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            conversationId: conversationId,
            senderId: user1,
            content: 'Hello from user-1! This is a test message.',
            type: 'text'
        })
    });

    if (!response.ok) {
        console.log('❌ Failed to send message from user-1');
        const errorText = await response.text();
        console.log('Error:', errorText);
        return;
    }

    const messageData = await response.json();
    const messageId = messageData.message.id;
    console.log(`✅ Sent message: ${messageId}\n`);

    // Step 3: Send a reply from user-2
    console.log('3. Sending reply from user-2...');
    response = await fetch(`${baseUrl}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            conversationId: conversationId,
            senderId: user2,
            content: 'Hello user-1! This is my reply.',
            type: 'text'
        })
    });

    if (!response.ok) {
        console.log('❌ Failed to send reply from user-2');
        const errorText = await response.text();
        console.log('Error:', errorText);
        return;
    }

    const replyData = await response.json();
    const replyId = replyData.message.id;
    console.log(`✅ Sent reply: ${replyId}\n`);

    // Step 4: Retrieve all messages in the conversation
    console.log('4. Retrieving all messages...');
    response = await fetch(`${baseUrl}/api/messages?conversationId=${conversationId}`);

    if (!response.ok) {
        console.log('❌ Failed to retrieve messages');
        const errorText = await response.text();
        console.log('Error:', errorText);
        return;
    }

    const messagesData = await response.json();
    const messages = messagesData.messages || [];

    console.log(`📨 Found ${messages.length} messages in conversation:\n`);

    messages.forEach((msg, index) => {
        console.log(`${index + 1}. ${msg.senderId}: ${msg.content}`);
        console.log(`   Status: ${msg.status || 'unknown'}`);
        console.log(`   Created: ${new Date(msg.createdAt).toLocaleString()}`);
        console.log(`   Edited: ${msg.isEdited ? 'Yes' : 'No'}`);
        console.log(`   Deleted: ${msg.isDeleted ? 'Yes' : 'No'}\n`);
    });

    // Step 5: Test message persistence - wait a moment and check again
    console.log('5. Testing persistence - waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    response = await fetch(`${baseUrl}/api/messages?conversationId=${conversationId}`);
    if (!response.ok) {
        console.log('❌ Failed to retrieve messages on second check');
        const errorText = await response.text();
        console.log('Error:', errorText);
        return;
    }

    const messagesData2 = await response.json();
    const messages2 = messagesData2.messages || [];

    console.log(`📨 Second check - Found ${messages2.length} messages\n`);

    // Step 6: Test message editing
    console.log('6. Testing message editing...');
    response = await fetch(`${baseUrl}/api/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: 'Hello from user-1! This message has been edited.',
            senderId: user1
        })
    });

    if (!response.ok) {
        console.log('❌ Failed to edit message');
        const errorText = await response.text();
        console.log('Error:', errorText);
    } else {
        console.log('✅ Message edited successfully');
    }

    // Step 7: Final verification
    console.log('7. Final verification - retrieving messages again...');
    response = await fetch(`${baseUrl}/api/messages?conversationId=${conversationId}`);

    if (response.ok) {
        const finalData = await response.json();
        const finalMessages = finalData.messages || [];

        console.log(`📨 Final check - Found ${finalMessages.length} messages\n`);

        const editedMessage = finalMessages.find(m => m.id === messageId);
        if (editedMessage) {
            console.log(`✏️ Edited message content: "${editedMessage.content}"`);
            console.log(`✏️ Is edited: ${editedMessage.isEdited ? 'Yes' : 'No'}`);
        }

        console.log('\n🎯 MESSAGING PERSISTENCE TEST RESULTS:');
        console.log(`   - Messages created: ${messages.length === finalMessages.length ? '✅ PERSISTED' : '❌ LOST'}`);
        console.log(`   - Message editing: ${editedMessage?.isEdited ? '✅ WORKS' : '❌ FAILED'}`);
        console.log(`   - Cross-user messaging: ${finalMessages.length >= 2 ? '✅ WORKS' : '❌ FAILED'}`);
    }
}

testMessagingPersistence().catch(console.error);