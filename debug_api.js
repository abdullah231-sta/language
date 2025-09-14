// Debug script to test API directly
const https = require('https');
const http = require('http');

async function testAPI() {
  try {
    const url = 'http://localhost:3001/api/groups/bbdf6122-0d41-429c-b312-08cea20fa8c7/members';
    
    const data = await new Promise((resolve, reject) => {
      const req = http.get(url, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
    });
    
    console.log('=== API Response ===');
    console.log('Success:', data.success);
    console.log('Group ID:', data.group?.id);
    console.log('Group Name:', data.group?.name);
    console.log('Table Seats Count:', data.group?.tableSeats?.length);
    console.log('Waiting Users Count:', data.group?.waitingUsers?.length);
    console.log('Waiting Users:', JSON.stringify(data.group?.waitingUsers, null, 2));
    
    if (data.group?.waitingUsers && data.group.waitingUsers.length > 0) {
      console.log('\n=== Listener Details ===');
      data.group.waitingUsers.forEach((user, index) => {
        console.log(`Listener ${index + 1}:`, {
          id: user.id,
          name: user.name,
          hasRequested: user.hasRequested,
          role: user.role
        });
      });
    } else {
      console.log('\n❌ No listeners found in waitingUsers array');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();