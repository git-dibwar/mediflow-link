import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/auth";
import { toast } from "sonner";
import {
  Mail,
  User as UserIcon,
  Lock,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Heart,
  Building2,
  Pill,
  Microscope,
  Stethoscope
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Link } from "react-router-dom";
import { UserType } from "@/types/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const { user, isLoading, profile, signInWithEmail, signUpWithEmail, signInWithGoogle, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType>("patient");
  const [authTab, setAuthTab] = useState<"patient" | "professional">("patient");
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  const [renderForm, setRenderForm] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("signup") === "true") {
      setIsSignUp(true);
    }
    if (params.get("type") === "professional") {
      setAuthTab("professional");
      if (userType === "patient") {
        setUserType("doctor");
      }
    }
  }, [location, userType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialAuthCheckComplete(true);
      setRenderForm(true);
    }, 600);
    
    if (!isLoading) {
      clearTimeout(timer);
      setInitialAuthCheckComplete(true);
      setRenderForm(true);
    }
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (user && !isLoading && profile) {
      console.log("User authenticated, navigating to dashboard. User type:", profile.user_type);
      
      setTimeout(() => {
        if (profile?.user_type === "patient") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/organization-dashboard", { replace: true });
        }
      }, 200);
    }
  }, [user, isLoading, profile, navigate]);

  useEffect(() => {
    if (authError) {
      const timer = setTimeout(() => {
        setAuthError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [authError]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    try {
      if (isSignUp) {
        const result = await signUpWithEmail(email, password, name, userType);
        
        if (result?.error) throw result.error;
        if (result?.success) {
          toast.success(`Sign up successful as ${userType}! Please check your email for verification.`);
        }
      } else {
        const result = await signInWithEmail(email, password);
        
        if (result?.error) throw result.error;
        if (result?.success) {
          toast.success("Signed in successfully!");
        }
      }
    } catch (error: any) {
      console.error(`Error ${isSignUp ? "signing up" : "signing in"}:`, error);
      setAuthError(error.message || `Failed to ${isSignUp ? "sign up" : "sign in"}`);
      toast.error(error.message || `Failed to ${isSignUp ? "sign up" : "sign in"}`);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      setAuthError(error.message || "Failed to sign in with Google");
      toast.error("Failed to sign in with Google");
    }
  };

  const handleUserTypeSelect = (value: string) => {
    setUserType(value as UserType);
  };

  const getUserTypeIcon = () => {
    switch (userType) {
      case "doctor":
        return <Stethoscope className="h-5 w-5 text-blue-500" />;
      case "clinic":
        return <Building2 className="h-5 w-5 text-green-500" />;
      case "pharmacy":
        return <Pill className="h-5 w-5 text-red-500" />;
      case "laboratory":
        return <Microscope className="h-5 w-5 text-purple-500" />;
      default:
        return <Heart className="h-5 w-5 text-rose-500" />;
    }
  };

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const resetAuth = () => {
    localStorage.removeItem('mediflow-auth');
    localStorage.removeItem('supabase.auth.token');
    sessionStorage.clear();
    toast.info("Auth storage cleared. Try logging in again.");
  };

  if (!renderForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-medical-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={goBack} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-medical-primary flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-medical-primary to-blue-700 bg-clip-text text-transparent">MediFlow</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetAuth}>Reset Auth</Button>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-sm border border-border">
          <Tabs 
            value={authTab} 
            onValueChange={(value) => {
              setAuthTab(value as "patient" | "professional");
              if (value === "patient") {
                setUserType("patient");
              } else if (value === "professional" && userType === "patient") {
                setUserType("doctor");
              }
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="patient" className="relative">
                <Heart className="mr-2 h-4 w-4" />
                Patient
              </TabsTrigger>
              <TabsTrigger value="professional">
                <Stethoscope className="mr-2 h-4 w-4" />
                Professional
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patient">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground">
                  {isSignUp ? "Create your patient account" : "Welcome back"}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {isSignUp
                    ? "Sign up as a patient to access your health information"
                    : "Sign in to access your medical records and consultations"}
                </p>
              </div>

              {authError && (
                <Alert variant="destructive" className="text-sm mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleEmailAuth} className="mt-6 space-y-4">
                <input type="hidden" value="patient" name="userType" />
                
                {isSignUp && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                  {isSignUp && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Password must be at least 6 characters long
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isAuthLoading}
                >
                  {isAuthLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : isSignUp ? "Sign Up" : "Sign In"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                  type="button"
                  disabled={isAuthLoading}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                    </g>
                  </svg>
                  Continue with Google
                </Button>

                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setAuthError(null);
                      const url = new URL(window.location.href);
                      if (isSignUp) {
                        url.searchParams.delete("signup");
                      } else {
                        url.searchParams.set("signup", "true");
                      }
                      window.history.pushState({}, "", url);
                    }}
                    className="text-medical-primary hover:underline text-sm"
                  >
                    {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                  </button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="professional">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground">
                  {isSignUp ? "Register as a Healthcare Provider" : "Provider Login"}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {isSignUp
                    ? "Create your professional account"
                    : "Access your healthcare provider dashboard"}
                </p>
              </div>

              {authError && (
                <Alert variant="destructive" className="text-sm mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleEmailAuth} className="mt-6 space-y-4">
                {isSignUp && (
                  <>
                    <div>
                      <label htmlFor="prof-name" className="block text-sm font-medium text-foreground mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="prof-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                          required={isSignUp}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="userType" className="block text-sm font-medium text-foreground mb-1">
                        Provider Type
                      </label>
                      <Select 
                        value={userType} 
                        onValueChange={handleUserTypeSelect}
                      >
                        <SelectTrigger className="w-full pl-10">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            {getUserTypeIcon()}
                          </div>
                          <SelectValue placeholder="Select provider type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="doctor">
                            <div className="flex items-center">
                              <Stethoscope className="mr-2 h-4 w-4 text-blue-500" />
                              Doctor
                            </div>
                          </SelectItem>
                          <SelectItem value="clinic">
                            <div className="flex items-center">
                              <Building2 className="mr-2 h-4 w-4 text-green-500" />
                              Clinic
                            </div>
                          </SelectItem>
                          <SelectItem value="pharmacy">
                            <div className="flex items-center">
                              <Pill className="mr-2 h-4 w-4 text-red-500" />
                              Pharmacy
                            </div>
                          </SelectItem>
                          <SelectItem value="laboratory">
                            <div className="flex items-center">
                              <Microscope className="mr-2 h-4 w-4 text-purple-500" />
                              Laboratory
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                <div>
                  <label htmlFor="pro-email" className="block text-sm font-medium text-foreground mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="pro-email"
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
                  <label htmlFor="pro-password" className="block text-sm font-medium text-foreground mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="pro-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                  {isSignUp && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Password must be at least 6 characters long
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isAuthLoading}
                >
                  {isAuthLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : isSignUp ? "Create Provider Account" : "Sign In"}
                </Button>

                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setAuthError(null);
                      const url = new URL(window.location.href);
                      if (isSignUp) {
                        url.searchParams.delete("signup");
                      } else {
                        url.searchParams.set("signup", "true");
                      }
                      window.history.pushState({}, "", url);
                    }}
                    className="text-medical-primary hover:underline text-sm"
                  >
                    {isSignUp ? "Already have a provider account? Sign In" : "Register as a provider"}
                  </button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Login;
