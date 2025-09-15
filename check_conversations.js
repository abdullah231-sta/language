// Check conversations for a user
async function checkConversations() {
  const response = await fetch('http://127.0.0.1:3000/api/conversations?userId=185acadb-199b-4cfd-b674-547a1ff4277a');
  const data = await response.json();
  console.log('Conversations for user1:', JSON.stringify(data, null, 2));
}

checkConversations().catch(console.error);