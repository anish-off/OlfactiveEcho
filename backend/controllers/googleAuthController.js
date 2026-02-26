const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (user) => {
    const payload = {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.googleSignIn = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: 'Google credential is required' });
        }

        // Verify the Google ID token
        let ticket;
        try {
            ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
        } catch (verifyError) {
            console.error('Google token verification failed:', verifyError);
            return res.status(401).json({ message: 'Invalid Google token' });
        }

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        console.log('=== GOOGLE SIGN-IN DEBUG ===');
        console.log('Google ID:', googleId);
        console.log('Email:', email);
        console.log('Name:', name);

        // Check if user exists by googleId or email
        let user = await User.findOne({
            $or: [{ googleId }, { email }]
        });

        if (user) {
            // User exists - update googleId if not set
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
                await user.save();
            }
            console.log('Existing user found:', user._id);
        } else {
            // Create new user
            user = await User.create({
                name,
                email,
                googleId,
                authProvider: 'google',
                avatar: picture,
                role: 'user'
            });
            console.log('New user created:', user._id);
        }

        // Generate JWT token
        const token = signToken(user);

        const responseData = {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role
            },
            token
        };

        console.log('Google sign-in successful, sending response');
        res.json(responseData);

    } catch (err) {
        console.error('Google sign-in error:', err);
        res.status(500).json({ message: 'Failed to sign in with Google' });
    }
};
