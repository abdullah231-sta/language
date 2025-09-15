// Simple conversation creation test
async function testSimpleConversation() {
  const baseUrl = 'http://127.0.0.1:3000';

  console.log('🧪 Testing Simple Conversation Creation...\n');

  const user1 = '185acadb-199b-4cfd-b674-547a1ff4277a';
  const user2 = '4d40cf99-2e87-441a-bca7-b9e8a2fcbbcf';

  console.log('Creating conversation...');
  const response = await fetch(`${baseUrl}/api/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user1,
      participantId: user2
    })
  });

  console.log('Response status:', response.status);
  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));
}

testSimpleConversation().catch(console.error);