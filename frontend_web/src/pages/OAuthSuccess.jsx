import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OAuthSuccess() {
  const navigate = useNavigate();

  // Define the cookie extraction function
  const getTokenFromCookie = () => {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('jwt_token='));
    return cookie ? cookie.split('=')[1] : null;
  };

  useEffect(() => {
    try {
      console.log("OAuthSuccess rendered, checking for token");
      console.log("All cookies:", document.cookie);
      const token = getTokenFromCookie();
      console.log("Found token:", token);

      if (token) {
        // Store the token
        console.log("Storing token and user data");
        localStorage.setItem('token', token);
        
        const userData = {
          name: 'User', // Default fallback name
          avatar: '/default-avatar.png'
        };
        
        try {
          // Decode the JWT token to get user info
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            if (payload.name) {
              userData.name = payload.name;
            }
            // If there's an avatar or picture in the payload
            if (payload.picture) {
              userData.avatar = payload.picture;
            }
            if (payload.googleId){
              userData.googleId = payload.googleId;
            }  
          }
        } catch (e) {
          console.error('Error decoding token:', e);
        }
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update app state to notify about authentication
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('loginSuccess'));
        
        // Use React Router for navigation
        console.log("Navigating to homepage");
        navigate('/');
      } else {
        // Fallback: Check URL for token (for debugging)
        const query = new URLSearchParams(window.location.search);
        const urlToken = query.get('token');
        
        if (urlToken) {
          console.log("Token found in URL");
          localStorage.setItem('token', urlToken);
          
          // Update app state
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('loginSuccess'));
          
          navigate('/');
        } else {
          console.log("No token found, redirecting to login");
          navigate('/login', { state: { error: 'Google login failed - no token received' } });
        }
      }
    } catch (error) {
      console.error('Error during OAuth processing:', error);
      navigate('/login', { state: { error: 'An error occurred during login' } });
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Processing Google login...</h2>
        <p>Please wait while we redirect you.</p>
      </div>
    </div>
  );
}