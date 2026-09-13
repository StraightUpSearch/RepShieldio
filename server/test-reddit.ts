// Simple Reddit API test
console.log('Testing Reddit API credentials...');
console.log('REDDIT_CLIENT_ID:', process.env.REDDIT_CLIENT_ID);
console.log('REDDIT_CLIENT_SECRET:', process.env.REDDIT_CLIENT_SECRET ? 'SET' : 'NOT SET');
console.log('REDDIT_USER_AGENT:', process.env.REDDIT_USER_AGENT);

async function testRedditAuth() {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const userAgent = process.env.REDDIT_USER_AGENT;

  if (!clientId || !clientSecret || !userAgent) {
    console.error('Missing Reddit credentials');
    return;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  try {
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'User-Agent': userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    console.log('Auth response status:', response.status);
    const data = await response.text();
    console.log('Auth response:', data);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testRedditAuth();