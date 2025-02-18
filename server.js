const express = require('express');
const OAuth = require('oauth');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

// OAuth configuration
const oauth = new OAuth.OAuth2(
    process.env.YAHOO_CLIENT_ID,
    process.env.YAHOO_CLIENT_SECRET,
    'https://api.login.yahoo.com/',
    'oauth2/request_auth',
    'oauth2/get_token',
    null
);

// Serve static files
app.use(express.static(path.join(__dirname)));

// Auth routes
app.get('/auth', (req, res) => {
    const authUrl = oauth.getAuthorizeUrl({
        redirect_uri: 'http://localhost:3000/auth/callback',
        response_type: 'code',
        scope: 'fspt-w'
    });
    res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
    const code = req.query.code;
    
    try {
        const token = await new Promise((resolve, reject) => {
            oauth.getOAuthAccessToken(
                code,
                {
                    grant_type: 'authorization_code',
                    redirect_uri: 'http://localhost:3000/auth/callback'
                },
                (err, access_token, refresh_token, results) => {
                    if (err) reject(err);
                    else resolve({ access_token, refresh_token });
                }
            );
        });
        
        // Store token in session or cookie
        res.cookie('yahoo_token', token.access_token, { httpOnly: true });
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Authentication failed');
    }
});

// API route to get rankings
app.get('/api/rankings/:position', async (req, res) => {
    const token = req.cookies.yahoo_token;
    if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Implement Yahoo Fantasy Sports API call here
    // This is where you'll fetch actual rankings data
    res.json(sampleData[req.params.position] || []);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});