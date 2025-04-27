import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Checkbox } from '../components/ui/Checkbox';
import { PawPrint } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_USER;

export default function SignupPage() {
  // State for form inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupError, setSignupError] = useState("");

  


  const validateForm = () => {
    let formErrors = {};
    

    if (!firstName.trim()) {
      formErrors.firstName = "First name is required";
    }
    

    if (!lastName.trim()) {
      formErrors.lastName = "Last name is required";
    }
    

    if (!username.trim()) {
      formErrors.username = "Username is required";
    }

    if (!email.trim()) {
      formErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      formErrors.email = "Email is invalid";
    }
    

    if (!password) {
      formErrors.password = "Password is required";
    } else if (password.length < 6) {
      formErrors.password = "Password must be at least 6 characters";
    }
    

    if (!confirmPassword) {
      formErrors.confirmPassword = "Please confirm your password";
    } else if (confirmPassword !== password) {
      formErrors.confirmPassword = "Passwords do not match";
    }
    

    //if (!agreeTerms) {
    //  formErrors.agreeTerms = "You must agree to the terms and conditions";
    //}
    
    return formErrors;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    

    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
    
        const userData = {
          firstName,
          lastName,
          email,
          username,
          password,
          role: "CUSTOMER" 
        };

        console.log("Sending user data:", userData);
        
    
        const response = await fetch(`${API_BASE_URL}/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        
        const data = await response.text();
        
        if (response.ok) {
       
          setSignupSuccess(true);
          setSignupError("");
          
          // Clear form
          setFirstName("");
          setLastName("");
          setEmail("");
          setUsername("");
          setPassword("");
          setConfirmPassword("");
          setAgreeTerms(false);
          
  
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        } else {
    
          setSignupSuccess(false);
          setSignupError(data || "Registration failed. Please try again.");
        }
      } catch (error) {
        console.error("Error during signup:", error);
        setSignupSuccess(false);
        setSignupError("Network error. Please check your connection and try again.");
      } finally {
        setIsSubmitting(false);
      }
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
                <h1 className="text-3xl font-bold text-gray-900">Join Pawtopia</h1>
                <p className="text-gray-600">Create an account to access exclusive pet care services and products</p>
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
                <h1 className="text-2xl font-bold">Create an Account</h1>
                <p className="text-gray-500 text-sm">Fill in your details to join our pet-loving community</p>
              </div>

        
              {signupSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  <span className="block sm:inline">Account created successfully! Redirecting to login...</span>
                </div>
              )}

     
              {signupError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <span className="block sm:inline">{signupError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      placeholder="Enter first name" 
                      className={`rounded-lg ${errors.firstName ? 'border-red-500' : ''}`}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Enter last name" 
                      className={`rounded-lg ${errors.lastName ? 'border-red-500' : ''}`}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    type="username" 
                    placeholder="Enter your username" 
                    className={`rounded-lg ${errors.username ? 'border-red-500' : ''}`}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  {errors.username  && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>


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
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Create a password" 
                    className={`rounded-lg ${errors.password ? 'border-red-500' : ''}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="Confirm your password" 
                    className={`rounded-lg ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

              
                <Button 
                  type="submit" 
                  className="w-full rounded-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating account...' : 'Sign Up'}
                </Button>

                <div className="text-center text-sm">
                  <span className="text-gray-500">Already have an account?</span>{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Login
                  </Link>
                </div>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  type="button"
                  variant="outline" 
                  className="rounded-lg"
                  onClick={() => alert("Google signup would be implemented here")}
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