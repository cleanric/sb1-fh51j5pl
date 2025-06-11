const { Client, Users } = require('node-appwrite');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  console.log('Appwrite auth function called');
  console.log('HTTP Method:', event.httpMethod);
  console.log('Origin:', event.headers.origin);

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Check for required environment variables first
    const hasEndpoint = !!process.env.APPWRITE_ENDPOINT;
    const hasProjectId = !!process.env.APPWRITE_PROJECT_ID;
    const hasApiKey = !!process.env.APPWRITE_API_KEY;

    console.log('Environment variables check:', {
      hasEndpoint,
      hasProjectId,
      hasApiKey
    });

    if (!hasEndpoint || !hasProjectId || !hasApiKey) {
      console.error('Missing Appwrite environment variables');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        body: JSON.stringify({ 
          error: 'Appwrite configuration missing',
          details: {
            hasEndpoint,
            hasProjectId,
            hasApiKey
          }
        })
      };
    }

    // Parse the request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body || '{}');
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        body: JSON.stringify({ error: 'Invalid JSON in request body' })
      };
    }

    const { auth0Token, userId } = requestBody;

    if (!auth0Token || !userId) {
      console.log('Missing required fields:', { hasAuth0Token: !!auth0Token, hasUserId: !!userId });
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        body: JSON.stringify({ error: 'Missing auth0Token or userId' })
      };
    }

    // Verify the Auth0 token (basic validation)
    let auth0User;
    try {
      // Decode without verification for now (in production, you should verify with Auth0 public key)
      auth0User = jwt.decode(auth0Token);
      
      // Basic validation
      if (!auth0User || auth0User.sub !== userId) {
        throw new Error('Invalid token or user ID mismatch');
      }

      console.log('Auth0 token validated successfully for user:', userId);
    } catch (error) {
      console.error('Auth0 token validation failed:', error);
      return {
        statusCode: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        body: JSON.stringify({ error: 'Invalid Auth0 token' })
      };
    }

    // Initialize Appwrite client with server API key
    console.log('Initializing Appwrite client...');
    const client = new Client();
    client
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY); // Server API key for admin operations

    const users = new Users(client);

    // Check if user exists in Appwrite
    let appwriteUser;
    try {
      console.log('Checking if user exists in Appwrite:', userId);
      appwriteUser = await users.get(userId);
      console.log('Existing Appwrite user found:', userId);
    } catch (error) {
      console.log('User lookup error:', error.code, error.message);
      
      if (error.code === 404) {
        // User doesn't exist, create them
        try {
          console.log('Creating new Appwrite user...');
          appwriteUser = await users.create(
            userId, // Use Auth0 user ID as Appwrite user ID
            auth0User.email,
            undefined, // phone (optional)
            undefined, // password (not needed for our use case)
            auth0User.name || auth0User.email
          );
          console.log('Created new Appwrite user:', userId);
        } catch (createError) {
          console.error('Error creating Appwrite user:', createError);
          return {
            statusCode: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify({ 
              error: 'Failed to create Appwrite user',
              details: createError.message
            })
          };
        }
      } else {
        console.error('Error checking Appwrite user:', error);
        return {
          statusCode: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
          body: JSON.stringify({ 
            error: 'Failed to check Appwrite user',
            details: error.message
          })
        };
      }
    }

    // Generate a JWT for the authenticated user
    let jwtToken;
    try {
      console.log('Creating JWT for user:', userId);
      jwtToken = await users.createJWT(userId);
      console.log('JWT created successfully');
    } catch (jwtError) {
      console.error('Error creating JWT:', jwtError);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        body: JSON.stringify({ 
          error: 'Failed to create JWT',
          details: jwtError.message
        })
      };
    }
    
    console.log('Function completed successfully');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({
        success: true,
        token: jwtToken.jwt,
        userId: appwriteUser.$id,
        message: 'Appwrite JWT created'
      })
    };

  } catch (error) {
    console.error('Appwrite auth bridge error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      })
    };
  }
};