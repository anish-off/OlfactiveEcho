import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../../api/http';

const GoogleSignInButton = ({ onSuccess, onError }) => {
    const buttonRef = useRef(null);
    const { setAuthUser } = useAuth();

    useEffect(() => {
        // Check if Google Identity Services is loaded
        if (!window.google) {
            console.error('Google Identity Services not loaded');
            return;
        }

        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

        if (!clientId) {
            console.error('VITE_GOOGLE_CLIENT_ID not configured');
            toast.error('Google Sign-In not configured');
            return;
        }

        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
        });

        // Render the button
        if (buttonRef.current) {
            window.google.accounts.id.renderButton(
                buttonRef.current,
                {
                    theme: 'outline',
                    size: 'large',
                    width: buttonRef.current.offsetWidth,
                    text: 'signin_with',
                    shape: 'rectangular',
                }
            );
        }
    }, []);

    const handleCredentialResponse = async (response) => {
        try {
            const { credential } = response;

            // Send the credential to your backend
            const res = await axios.post(`${API_BASE_URL}/auth/google`, {
                credential,
            });

            const { user, token } = res.data;

            // Update auth context
            setAuthUser(user);
            localStorage.setItem('token', token);

            toast.success(`Welcome, ${user.name}!`);

            // Call success callback
            if (onSuccess) {
                onSuccess(user);
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to sign in with Google';
            toast.error(errorMessage);

            // Call error callback
            if (onError) {
                onError(errorMessage);
            }
        }
    };

    return (
        <div
            ref={buttonRef}
            className="w-full"
            style={{ minHeight: '40px' }}
        />
    );
};

export default GoogleSignInButton;
