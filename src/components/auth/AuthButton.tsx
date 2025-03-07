
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User as UserIcon } from 'lucide-react'
import { toast } from "sonner"
import { useAuth } from '@/hooks/useAuth'

const AuthButton = () => {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSignIn = () => {
    navigate('/login')
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success("Successfully signed out")
    } catch (error: any) {
      console.error("Error signing out:", error)
      toast.error("Error signing out")
    }
  }

  if (isLoading) {
    return <Button variant="outline" disabled>Loading...</Button>
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-medical-secondary">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-medical-primary text-white">
                {user.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            {user.user_metadata?.full_name || user.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button onClick={handleSignIn} className="flex items-center gap-2">
      <UserIcon className="h-4 w-4" />
      Sign in
    </Button>
  )
}

export default AuthButton
