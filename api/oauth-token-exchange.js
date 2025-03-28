// Serverless function for handling OAuth token exchange securely
// This will be deployed to Vercel along with your app

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    
    // Use environment variables for sensitive data
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    // Get origin from request headers to build the correct redirect URI
    // The redirect URI must exactly match what's registered in Google Cloud Console
    // and what was used in the authorization request
    const origin = req.headers.origin || 'https://effisense.vercel.app';
    const redirectUri = `${origin}/auth-callback`;
    
    console.log("Using redirect URI for token exchange:", redirectUri);

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error exchanging code for tokens:', data);
      return res.status(response.status).json({ error: data.error_description || 'Failed to exchange code for tokens' });
    }

    // Return tokens to client
    return res.status(200).json(data);
  } catch (error) {
    console.error('Server error during OAuth token exchange:', error);
    return res.status(500).json({ error: 'Server error during token exchange' });
  }
}