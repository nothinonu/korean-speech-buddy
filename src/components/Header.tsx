import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AuthForm } from "./AuthForm";
import { ProfileModal } from "./ProfileModal";
import { LogIn, User, Settings, Crown, LogOut, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    signOut();
  };

  const displayUser = user ? {
    id: user.id,
    username: user.user_metadata?.username || user.email?.split('@')[0] || "게이머",
    email: user.email || "",
    avatar: undefined,
    isPremium: false // TODO: 실제 구독 상태로 교체
  } : null;

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">K</span>
            </div>
            <span className="font-bold text-xl text-foreground">한국 스팀 커뮤니티</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              게임 찾기
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              플레이어
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              채널
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary">
              커뮤니티
            </Button>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {displayUser ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell size={18} />
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    3
                  </Badge>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={displayUser.avatar || "/placeholder.svg"} alt={displayUser.username} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                          {displayUser.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {displayUser.isPremium && (
                        <Crown 
                          size={12} 
                          className="absolute -top-1 -right-1 text-yellow-500 fill-yellow-500" 
                        />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-card border-border" align="end" forceMount>
                    <div 
                      className="flex items-center justify-start gap-2 p-2 cursor-pointer hover:bg-muted/50 rounded-md transition-colors"
                      onClick={() => setShowProfileModal(true)}
                    >
                      <div className="flex flex-col space-y-1 leading-none">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{displayUser.username}</p>
                          {displayUser.isPremium && (
                            <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 text-xs">
                              <Crown size={10} className="mr-1" />
                              프리미엄
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{displayUser.email}</p>
                        <p className="text-xs text-primary">프로필 카드 보기</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => navigate('/profile')}
                    >
                      <User className="mr-2 h-4 w-4" />
                      프로필 관리
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      설정
                    </DropdownMenuItem>
                    {!displayUser.isPremium && (
                      <DropdownMenuItem className="cursor-pointer bg-gradient-accent/10 text-accent-foreground">
                        <Crown className="mr-2 h-4 w-4" />
                        프리미엄 구독
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                onClick={() => setShowAuthForm(true)}
                className="bg-gradient-primary text-primary-foreground hover:shadow-glow"
              >
                <LogIn size={18} className="mr-2" />
                로그인
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthForm && <AuthForm onClose={() => setShowAuthForm(false)} />}
      
      {/* Profile Modal */}
      {showProfileModal && <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />}
    </>
  );
};