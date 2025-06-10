//const fetch = require('node-fetch'); // At the top of your file
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

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

    const record = codes[code];
    if (record.status === 'linked') {
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: 'linked',
          token: record.token,
          expiresAt: record.expiresAt,
          user: record.user,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ status: record.status }),
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

      const expiresIn = Number(userInfo.expires_in || 3600);

      codes[code].status = 'linked';
      codes[code].token = token;
      codes[code].expiresAt = Date.now() + expiresIn * 1000;
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
