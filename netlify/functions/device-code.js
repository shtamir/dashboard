const fetch = require('node-fetch'); // At the top of your file

let codes = {}; // In-memory for demo; use a DB for production

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    // Generate a code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    codes[code] = { status: 'pending' };
    return {
      statusCode: 200,
      body: JSON.stringify({ code }),
    };
  }
  if (event.httpMethod === 'GET') {
    // Check code status
    const code = event.queryStringParameters.code;
    if (!code || !codes[code]) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Not found' }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(codes[code]),
    };
  }
  if (event.httpMethod === 'PUT') {
    // Link the code
    const { code, token } = JSON.parse(event.body || '{}');
    if (!code || !codes[code]) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Not found' }),
      };
    }
    if (!token) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing token' }),
      };
    }

    // Verify the token with Google
    try {
      const resp = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
      if (!resp.ok) {
        return {
          statusCode: 401,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid Google token' }),
        };
      }
      const userInfo = await resp.json();
      // userInfo contains fields like email, sub (user id), etc.

      codes[code].status = 'linked';
      codes[code].user = {
        email: userInfo.email,
        sub: userInfo.sub,
        name: userInfo.name,
        picture: userInfo.picture,
      };
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, user: codes[code].user }),
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Token verification failed' }),
      };
    }
  }
  return {
    statusCode: 405,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Method Not Allowed' }),
  };
};
