const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

// Initialize OAuth2 client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// In-memory storage for codes (replace with database in production)
const codes = new Map();

exports.handler = async (event, context) => {
  console.log('📥 Device code function called:', {
    method: event.httpMethod,
    path: event.path,
    queryStringParameters: event.queryStringParameters
  });

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS request');
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Generate new code
    if (event.httpMethod === 'POST') {
      console.log('📝 Generating new device code');
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.set(code, {
        status: 'pending',
        createdAt: Date.now()
      });
      console.log('✅ Code generated:', { code, status: 'pending' });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ code })
      };
    }

    // Check code status
    if (event.httpMethod === 'GET') {
      const { code } = event.queryStringParameters || {};
      console.log('🔍 Checking code status:', { code });
      
      if (!code) {
        console.error('❌ No code provided');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Code is required' })
        };
      }

      const codeData = codes.get(code);
      console.log('📊 Code data:', codeData);

      if (!codeData) {
        console.error('❌ Code not found');
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Code not found' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ status: codeData.status })
      };
    }

    // Link code with Google account
    if (event.httpMethod === 'PUT') {
      const { code, token } = JSON.parse(event.body);
      console.log('🔗 Linking code with Google account:', { 
        code, 
        hasToken: !!token 
      });

      if (!code || !token) {
        console.error('❌ Missing code or token');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Code and token are required' })
        };
      }

      const codeData = codes.get(code);
      console.log('📊 Existing code data:', codeData);

      if (!codeData) {
        console.error('❌ Code not found');
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Code not found' })
        };
      }

      if (codeData.status === 'linked') {
        console.error('❌ Code already linked');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Code already linked' })
        };
      }

      try {
        console.log('🔐 Verifying Google token...');
        const ticket = await oauth2Client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        console.log('✅ Token verified, payload:', {
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        });

        // Update code status
        codes.set(code, {
          ...codeData,
          status: 'linked',
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          linkedAt: Date.now()
        });

        console.log('✅ Code linked successfully');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            status: 'linked',
            email: payload.email,
            name: payload.name,
            picture: payload.picture
          })
        };
      } catch (error) {
        console.error('❌ Token verification failed:', error);
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid token' })
        };
      }
    }

    console.error('❌ Method not allowed');
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('❌ Server error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
