import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, LogOut, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { toggleSidebar } from '@/redux/slices/uiSlice'
import { logout } from '@/redux/slices/authSlice'
import { getInitials } from '@/utils/formatters'
import { NotificationPreviewDialog } from '@/components/layout/NotificationPreviewDialog'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { imageUrl } from '@/components/common/imageUrl'
import { useGetMyProfileQuery } from '@/redux/api/authApi'

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/cars': 'Car List',
  '/booking-management': 'Booking Management',
  '/calender': 'Calendar',
  '/transactions-history': 'Transactions History',
  '/reviews-ratings': 'Reviews & Ratings',
  '/notification': 'Notification',
  '/subscription-packages': 'Subscription Package',
  '/support': 'Support',
  '/client-management': 'Client Management',
  '/agency-management': 'Agency Management',
  '/users': 'User Management',
  '/controller': 'Controller',
  '/products': 'Product Management',
  '/categories': 'Category Management',
  '/settings/profile': 'Profile Settings',
  '/settings/password': 'Change Password',
  '/settings/terms': 'Terms & Conditions',
  '/settings/privacy': 'Privacy Policy',
  '/settings/about-us': 'About Us',
}

export function Header() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  // const { theme } = useAppSelector((state) => state.ui)
  const { user } = useAppSelector((state) => state.auth)
  const { data: myProfileData } = useGetMyProfileQuery()
  const location = useLocation()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const pageTitle = routeTitles[location.pathname] || 'Dashboard'
  const profilePhotoPath =
    myProfileData?.data?.image?.trim() || myProfileData?.data?.profileImage?.trim() || ''
  const profilePhoto = profilePhotoPath ? imageUrl(profilePhotoPath) : user?.avatar
  const displayName = myProfileData?.data?.name?.trim() || `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
  const [displayFirstName, ...displayRestName] = displayName.split(' ').filter(Boolean)
  const displayLastName = displayRestName.join(' ')

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      dispatch(logout())
      navigate('/auth/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 h-20 shadow-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-accent">{pageTitle}</h1>
            <p className="text-sm text-accent hidden sm:block">
              Welcome back, {displayFirstName || user?.firstName || 'Admin'}
            </p>
          </div>
        </div>

        {/* Center - Search (hidden on mobile) */}
        {/* <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search anything..."
              className="pl-9 bg-muted/50"
            />
          </div>
        </div> */}

        {/* Right side */}
        <div className="flex items-center gap-5">
          {/* Theme toggle */}
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleTheme())}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-accent" />
            ) : (
              <Sun className="h-5 w-5 text-accent" />
            )}
          </Button> */}

          {/* Notifications — anchored popover under bell */}
          <NotificationPreviewDialog />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profilePhoto} alt={displayName || 'User'} />
                  <AvatarFallback className="text-white bg-primary" >
                    {getInitials(displayFirstName || user?.firstName, displayLastName || user?.lastName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {displayName || 'Admin User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || 'admin@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings/password')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setLogoutDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ConfirmDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogout}
        onSuccess={() => setLogoutDialogOpen(false)}
        title="Confirm logout"
        description="Are you sure you want to log out?"
        confirmText="Logout"
        cancelText="Cancel"
        variant="danger"
        isLoading={isLoggingOut}
      />
    </header>
  )
}
