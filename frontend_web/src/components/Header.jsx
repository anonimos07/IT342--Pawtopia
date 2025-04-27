import { useEffect, useState } from 'react';  
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Search, ShoppingBag, Menu, PawPrint, LogOut, User } from 'lucide-react';

import logout from '../assets/logout.gif';

import Avatar from './ui/Avatar';

export default function Header({ activePage = 'home' }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // New state for logout animation

  const navigate = useNavigate();

  // Debug activePage
  console.log('Header activePage:', activePage);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            setUser({ name: 'User', avatar: '/default-avatar.png' });
          }
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error parsing user data:", error);
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    const handleLoginSuccess = () => {
      checkAuth();
    };
    
    window.addEventListener('loginSuccess', handleLoginSuccess);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, []);
  
  const handleLogout = () => {
    // Show logout animation
    setIsLoggingOut(true);
    
    // Wait for 1.5 seconds to show the animation before proceeding
    setTimeout(() => {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem("email");
      localStorage.removeItem("id");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      localStorage.clear();
      
      // Update state
      setIsAuthenticated(false);
      setUser(null);
      setShowDropdown(false);
      setIsLoggingOut(false);
      
      // Dispatch events to notify other components
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent("logoutSuccess"));
      
      // Redirect to login page
      navigate('/login');
    }, 1500);
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.avatar-dropdown')) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
          <img 
            src={logout}
            alt="Logging out..." 
            className="w-32 h-32 object-contain"
          />
          <div className="text-center mt-4">
            <p className="text-white text-lg font-medium">Logging you out...</p>
            <p className="text-gray-300 text-sm mt-1">Please wait while we secure your session</p>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PawPrint className="h-8 w-8 text-indigo-600" />
          <span className="font-bold text-2xl text-indigo-600">Pawtopia</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className={`font-medium ${activePage === 'home' ? 'text-indigo-600 hover:text-indigo-500' : 'text-gray-600 hover:text-indigo-600'}`}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`font-medium ${activePage === 'products' ? 'text-indigo-600 hover:text-indigo-500' : 'text-gray-600 hover:text-indigo-600'}`}
          >
            Products
          </Link>
          <Link
            to="/services"
            className={`font-medium ${activePage === 'services' ? 'text-indigo-600 hover:text-indigo-500' : 'text-gray-600 hover:text-indigo-600'}`}
          >
            Services
          </Link>
          <Link
            to="/about"
            className={`font-medium ${activePage === 'about' ? 'text-indigo-600 hover:text-indigo-500' : 'text-gray-600 hover:text-indigo-600'}`}
          >
            About Us
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-gray-600">
            <Link to="/cart" className="text-gray-600 inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 focus:ring focus:ring-indigo-200">
              <ShoppingBag className="h-5 w-5" />
            </Link>
          </Button>

          {isLoading ? (
            <div className="w-9 h-9"></div>
          ) : isAuthenticated && user ? (
            <div className="relative avatar-dropdown">
              <div 
                className="cursor-pointer" 
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <Avatar className="h-9 w-9 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                  <Avatar.Fallback>{(user?.name?.[0] || 'U').toUpperCase()}</Avatar.Fallback>
                </Avatar>
              </div>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="font-medium">Signed in as</div>
                    <div className="truncate">{user?.name || 'User'}</div>
                  </div>
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    Your Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button className="hidden md:flex bg-indigo-600 hover:bg-indigo-500 text-white" asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden text-gray-600">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}