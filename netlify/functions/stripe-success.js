const { Client, Databases, Query, Permission, Role } = require('node-appwrite');

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const { session_id, user_id, plan_type, billing_cycle } = event.queryStringParameters;

  if (!session_id || !user_id || !plan_type) {
    return {
      statusCode: 400,
      headers: {
        'Location': `${process.env.URL}/search?error=missing_parameters`
      },
      body: ''
    };
  }

  try {
    // Initialize Appwrite client
    const client = new Client();
    client
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY); // Server API key

    const databases = new Databases(client);

    // Define credit amounts based on plan type
    const creditAmounts = {
      'starter': {
        insights: 120,
        greaterStrategy: 10,
        warmthSearches: 120
      },
      'pro': {
        insights: 400,
        greaterStrategy: 20,
        warmthSearches: 400
      },
      'insight-boost': {
        insights: 1,
        greaterStrategy: 0,
        warmthSearches: 0
      },
      'strategy-boost': {
        insights: 0,
        greaterStrategy: 1,
        warmthSearches: 0
      }
    };

    const credits = creditAmounts[plan_type];
    if (!credits) {
      throw new Error(`Invalid plan type: ${plan_type}`);
    }

    // Find existing user document
    const existingDocs = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      'insights',
      [Query.equal('userId', user_id)]
    );

    if (existingDocs.documents.length > 0) {
      // Update existing document
      const existingDoc = existingDocs.documents[0];
      const updatedData = {
        plan: plan_type === 'insight-boost' || plan_type === 'strategy-boost' ? existingDoc.plan : plan_type,
        remainingInsights: existingDoc.remainingInsights + credits.insights,
        remainingGreaterStrategy: existingDoc.remainingGreaterStrategy + credits.greaterStrategy,
        remainingWarmthSearches: existingDoc.remainingWarmthSearches + credits.warmthSearches
      };

      await databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID,
        'insights',
        existingDoc.$id,
        updatedData
      );
    } else {
      // Create new document with proper permissions
      const newData = {
        userId: user_id,
        count: 0,
        lastDate: new Date().toISOString().split('T')[0],
        plan: plan_type === 'insight-boost' || plan_type === 'strategy-boost' ? null : plan_type,
        remainingInsights: credits.insights,
        remainingGreaterStrategy: credits.greaterStrategy,
        remainingWarmthSearches: credits.warmthSearches,
        region: null
      };

      const permissions = [
        Permission.read(Role.user(user_id)),
        Permission.write(Role.user(user_id))
      ];

      await databases.createDocument(
        process.env.APPWRITE_DATABASE_ID,
        'insights',
        'unique()',
        newData,
        permissions
      );
    }

    // Redirect to search page with plan information
    const redirectUrl = `${process.env.URL}/search?purchase_success=true&plan=${plan_type}&billing=${billing_cycle || 'one-time'}`;
    
    return {
      statusCode: 302,
      headers: {
        'Location': redirectUrl
      },
      body: ''
    };

  } catch (error) {
    console.error('Error processing purchase:', error);
    
    // Redirect to error page
    return {
      statusCode: 302,
      headers: {
        'Location': `${process.env.URL}/search?error=processing_failed`
      },
      body: ''
    };
  }
};