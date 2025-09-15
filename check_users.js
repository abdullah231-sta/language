// Check existing users
async function checkUsers() {
  const response = await fetch('http://127.0.0.1:3000/api/users');
  const data = await response.json();
  console.log('Users API Response:', JSON.stringify(data, null, 2));
}

checkUsers().catch(console.error);