import { useEffect, useState } from 'react';  
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Search, ShoppingBag, Menu, PawPrint, LogOut } from 'lucide-react';
import Avatar from './ui/Avatar';

export default function Header({ activePage = 'home' }) {
  // Initialize as explicitly false to ensure login button shows first
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  // Add a loading state to prevent any UI flickering
  const [isLoading, setIsLoading] = useState(true);
  // State for dropdown menu
  const [showDropdown, setShowDropdown] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status on component mount
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Get user information from localStorage if available
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            // If no user info stored, use default placeholder
            setUser({ name: 'User', avatar: '/default-avatar.png' });
          }
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error parsing user data:", error);
          setUser(null);
          setIsAuthenticated(false);
          // Clear invalid token or user data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      // Authentication check is complete
      setIsLoading(false);
    };

    // Initial check
    checkAuth();

    // Listen for storage events (used by LoginPage)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for login success
    const handleLoginSuccess = () => {
      checkAuth();
    };
    
    window.addEventListener('loginSuccess', handleLoginSuccess);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, []);
  
  // Logout function
  const handleLogout = () => {
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
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent("logoutSuccess"));
    
    // Redirect to home page
    navigate('/');
  };
  
  // Close dropdown when clicking outside
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
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PawPrint className="h-8 w-8 text-primary" />
          <span className="font-bold text-2xl text-primary">Pawtopia</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className={`font-medium ${activePage === 'home' ? 'text-primary hover:text-primary/80' : 'text-gray-600 hover:text-primary'}`}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`font-medium ${activePage === 'products' ? 'text-primary hover:text-primary/80' : 'text-gray-600 hover:text-primary'}`}
          >
            Products
          </Link>
          <Link
            to="/services"
            className={`font-medium ${activePage === 'services' ? 'text-primary hover:text-primary/80' : 'text-gray-600 hover:text-primary'}`}
          >
            Services
          </Link>
          <Link
            to="/about"
            className={`font-medium ${activePage === 'about' ? 'text-primary hover:text-primary/80' : 'text-gray-600 hover:text-primary'}`}
          >
            About Us
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-gray-600">
            <Link to="/cart" className="text-gray-600 inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 focus:ring focus:ring-gray-200">
              <ShoppingBag className="h-5 w-5" />
            </Link>
          </Button>

          {isLoading ? (
            // Show nothing or a loading indicator while checking auth status
            <div className="w-9 h-9"></div>
          ) : isAuthenticated && user ? (
            // Show profile avatar when authenticated
            <div className="relative avatar-dropdown">
              <div 
                className="cursor-pointer" 
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <Avatar className="h-9 w-9">
                  <Avatar.Image src={user?.avatar || '/default-avatar.png'} alt={user?.name || 'User'} />
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
            // Show login button when not authenticated
            <Button className="hidden md:flex" asChild>
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