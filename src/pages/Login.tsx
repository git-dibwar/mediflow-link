
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Mail, User as UserIcon, Lock } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Login = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Redirect if already logged in
  if (user && !isLoading) {
    navigate("/");
    return null;
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    
    try {
      if (isSignUp) {
        // Sign up flow
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        
        if (error) throw error;
        toast.success("Sign up successful! Please check your email for verification.");
      } else {
        // Sign in flow
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        toast.success("Signed in successfully!");
        navigate("/");
      }
    } catch (error: any) {
      console.error(`Error ${isSignUp ? "signing up" : "signing in"}:`, error);
      toast.error(error.message || `Failed to ${isSignUp ? "sign up" : "sign in"}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      toast.error("Failed to sign in with Google");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white bg-medical-pattern">
      <Header />
      <main className="flex-1 medical-container py-8 flex items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to MedConnect</h1>
            <p className="mt-2 text-gray-600">
              {isSignUp 
                ? "Create an account to access your medical records" 
                : "Sign in to access your medical records and consultations"}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-6"
              disabled={authLoading || isLoading}
            >
              {authLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            className="w-full py-6 flex items-center justify-center gap-2"
            variant="outline"
            disabled={isLoading}
          >
            <UserIcon className="h-5 w-5" />
            {isLoading ? "Loading..." : "Sign in with Google"}
          </Button>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-medical-primary hover:underline text-sm"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
