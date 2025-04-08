import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Checkbox } from '../components/ui/Checkbox';
import { PawPrint } from 'lucide-react';

export default function LoginPage() {
  // State for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // State for form validation
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Form validation
  const validateForm = () => {
    let formErrors = {};
    
    // Email validation
    if (!email) {
      formErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = "Email is invalid";
    }
    
    // Password validation
    if (!password) {
      formErrors.password = "Password is required";
    } else if (password.length < 6) {
      formErrors.password = "Password must be at least 6 characters";
    }
    
    return formErrors;
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    setErrors(formErrors);
    
    // If no errors, submit form
    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true);
      
      // Mock API call - in a real app, this would be an actual API call
      setTimeout(() => {
        // Check if credentials are valid (mock check)
        if (email === "user@example.com" && password === "password123") {
          setLoginSuccess(true);
          setLoginError("");
          
          // Store user info in localStorage if rememberMe is checked
          if (rememberMe) {
            localStorage.setItem("user", JSON.stringify({ email }));
          }
          
          // Redirect to home page after successful login
          // In a real app, you might use a router for this
          window.location.href = "/";
        } else {
          setLoginSuccess(false);
          setLoginError("Invalid email or password");
        }
        
        setIsSubmitting(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
          <div className="hidden md:block bg-primary/10 rounded-2xl overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <PawPrint className="h-16 w-16 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome to Pawtopia</h1>
                <p className="text-gray-600">Your one-stop destination for all your pet's needs</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
            <img
              src="/placeholder.svg?height=800&width=600"
              alt="Happy pets"
              className="w-full h-full object-cover opacity-20"
            />
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border">
            <div className="space-y-6">
              <div className="space-y-2 text-center">
                <div className="flex justify-center md:hidden">
                  <PawPrint className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Login to Your Account</h1>
                <p className="text-gray-500 text-sm">Enter your credentials to access your account</p>
              </div>

              {/* Show success message */}
              {loginSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  <span className="block sm:inline">Login successful!</span>
                </div>
              )}

              {/* Show error message */}
              {loginError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <span className="block sm:inline">{loginError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    className={`rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password" 
                    className={`rounded-lg ${errors.password ? 'border-red-500' : ''}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    Remember me
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full rounded-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-gray-500">Don't have an account?</span>{" "}
                  <Link to="/signup" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </div>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  type="button"
                  variant="outline" 
                  className="rounded-lg"
                  onClick={() => alert("Google login would be implemented here")}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  className="rounded-lg"
                  onClick={() => alert("Facebook login would be implemented here")}
                >
                  <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <PawPrint className="h-5 w-5 text-primary" />
          <span className="font-bold text-primary">Pawtopia</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">© {new Date().getFullYear()} Pawtopia. All Rights Reserved.</p>
      </footer>
    </div>
  );
}