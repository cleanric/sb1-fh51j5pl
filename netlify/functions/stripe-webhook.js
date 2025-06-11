const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Client, Databases, Query, Permission, Role } = require('node-appwrite');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    // Verify the webhook signature
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Webhook signature verification failed' })
    };
  }

  // Handle the event
  switch (stripeEvent.type) {
    case 'checkout.session.completed':
      const session = stripeEvent.data.object;
      console.log('Payment succeeded for session:', session.id);
      
      // Extract user information from client_reference_id (this is the standard way)
      const userId = session.client_reference_id;
      
      // Extract plan details from metadata (if you decide to add metadata later)
      const planType = session.metadata?.planType; // 'starter', 'pro', 'insight-boost', 'strategy-boost'
      const billingCycle = session.metadata?.billingCycle; // 'monthly' or 'annual'
      
      if (!userId) {
        console.error('Missing userId (client_reference_id) in session:', session.id);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing userId in client_reference_id' })
        };
      }

      // Here you would update the user's credits in your database
      // For now, we'll log the information
      console.log('Processing credit update:', {
        userId,
        planType,
        billingCycle,
        sessionId: session.id,
        amountTotal: session.amount_total,
        currency: session.currency
      });

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

        const credits = creditAmounts[planType];
        if (!credits) {
          console.error(`Invalid plan type received: ${planType}`);
          return {
            statusCode: 400,
            body: JSON.stringify({ error: `Invalid plan type: ${planType}` })
          };
        }

        // Find existing user document
        const existingDocs = await databases.listDocuments(
          process.env.APPWRITE_DATABASE_ID,
          'insights',
          [Query.equal('userId', userId)]
        );

        if (existingDocs.documents.length > 0) {
          // Update existing document
          const existingDoc = existingDocs.documents[0];
          const updatedData = {
            // Only update plan if it's a subscription (not a boost)
            plan: (planType === 'starter' || planType === 'pro') ? planType : existingDoc.plan,
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
          console.log(`User ${userId} insights updated successfully.`);
        } else {
          // This case should ideally be handled by stripe-success.js creating the user,
          // but as a fallback, create a new document if it doesn't exist.
          console.warn(`Insights document not found for user ${userId}. Creating a new one.`);
          const newData = {
            userId: userId,
            count: 0,
            lastDate: new Date().toISOString().split('T')[0],
            plan: (planType === 'starter' || planType === 'pro') ? planType : null,
            remainingInsights: credits.insights,
            remainingGreaterStrategy: credits.greaterStrategy,
            remainingWarmthSearches: credits.warmthSearches,
            region: null // Region will be set by frontend on first login
          };

          const permissions = [
            Permission.read(Role.user(userId)),
            Permission.write(Role.user(userId))
          ];

          await databases.createDocument(
            process.env.APPWRITE_DATABASE_ID,
            'insights',
            'unique()', // Appwrite will generate a unique ID
            newData,
            permissions
          );
          console.log(`New insights document created for user ${userId}.`);
        }
      } catch (error) {
        console.error('Error updating user credits in Appwrite:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to update user credits' })
        };
      }
      
      break;

    default:
      console.log(`Unhandled event type: ${stripeEvent.type}`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true })
  };
};