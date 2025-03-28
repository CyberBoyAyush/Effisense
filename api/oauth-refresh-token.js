// Serverless function for securely refreshing OAuth tokens
// This will be deployed to Vercel along with your app

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const tokenUrl = 'https://oauth2.googleapis.com/token';
    
    // Use environment variables for sensitive data
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
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
      console.error('Error refreshing token:', data);
      return res.status(response.status).json({ error: data.error_description || 'Failed to refresh token' });
    }

    // Return new access token to client
    return res.status(200).json(data);
  } catch (error) {
    console.error('Server error during token refresh:', error);
    return res.status(500).json({ error: 'Server error during token refresh' });
  }
}