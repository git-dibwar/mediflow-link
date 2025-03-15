import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  FileText, 
  Home, 
  Menu, 
  MessageSquare, 
  Search, 
  User, 
  Users, 
  X, 
  Pill, 
  Calendar, 
  ClipboardList 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/auth";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Consultations', href: '/consultations', icon: MessageSquare },
    { name: 'Providers', href: '/providers', icon: Users },
    { name: 'Medications', href: '/medications', icon: Pill },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Records', href: '/records', icon: ClipboardList },
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-medical-primary flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-medical-primary to-blue-700 bg-clip-text text-transparent">MediFlow</span>
            </Link>
            
            <nav className="hidden md:ml-10 md:flex md:space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-medical-primary border-b-2 border-medical-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-1" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="hidden md:flex items-center space-x-3">
            <ModeToggle />
            
            <Button variant="outline" size="icon" className="rounded-full">
              <Search className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="icon" className="rounded-full relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-medical-accent rounded-full text-white text-xs flex items-center justify-center">3</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="bg-medical-secondary text-medical-primary">
                      {user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{user?.user_metadata?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex md:hidden items-center space-x-3">
            <ModeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden">
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background shadow-lg">
            <div className="flex items-center justify-between px-4 h-16 border-b border-border">
              <span className="text-xl font-semibold bg-gradient-to-r from-medical-primary to-blue-700 bg-clip-text text-transparent">MediFlow</span>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center py-3 px-4 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="border-t border-border px-4 py-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-medical-secondary text-medical-primary">
                    {user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.user_metadata?.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
