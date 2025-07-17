import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Gamepad2, Calendar, Crown, MapPin, Clock, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  level: number | null;
  is_premium: boolean | null;
  created_at: string;
  steam_id: string | null;
  steam_display_name: string | null;
  steam_avatar_url: string | null;
  steam_game_count: number | null;
  steam_level: number | null;
  favorite_games: string[] | null;
  play_style: string | null;
}

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      fetchProfile();
    }
  }, [isOpen, user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('프로필 조회 오류:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('프로필 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">프로필을 불러오는 중...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!profile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">프로필을 찾을 수 없습니다.</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const displayName = profile.display_name || profile.username;
  const avatarUrl = profile.steam_avatar_url || profile.avatar_url;
  const joinDate = new Date(profile.created_at).toLocaleDateString('ko-KR');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            내 프로필
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 기본 정보 */}
          <Card className="bg-background/50 border-border">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-primary">
                    <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {profile.is_premium && (
                    <Crown 
                      size={16} 
                      className="absolute -top-2 -right-2 text-yellow-500 fill-yellow-500" 
                    />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold text-foreground">{displayName}</h3>
                    {profile.is_premium && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900">
                        <Crown size={12} className="mr-1" />
                        프리미엄
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Gamepad2 size={14} />
                      <span>레벨 {profile.level || 1}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>가입일: {joinDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            {profile.bio && (
              <CardContent>
                <p className="text-muted-foreground">{profile.bio}</p>
              </CardContent>
            )}
          </Card>

          {/* Steam 정보 */}
          {profile.steam_id && (
            <Card className="bg-background/50 border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-700 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                  Steam 프로필
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Steam 닉네임</span>
                    <p className="font-medium">{profile.steam_display_name || '연결되지 않음'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Steam 레벨</span>
                    <p className="font-medium">레벨 {profile.steam_level || 0}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">보유 게임</span>
                    <p className="font-medium flex items-center gap-1">
                      <Users size={14} />
                      {profile.steam_game_count || 0}개
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 게임 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.favorite_games && profile.favorite_games.length > 0 && (
              <Card className="bg-background/50 border-border">
                <CardHeader>
                  <CardTitle className="text-lg">선호 게임</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.favorite_games.map((game, index) => (
                      <Badge key={index} variant="secondary">
                        {game}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {profile.play_style && (
              <Card className="bg-background/50 border-border">
                <CardHeader>
                  <CardTitle className="text-lg">플레이 스타일</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-gradient-cyber text-accent-foreground">
                    {profile.play_style}
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-3 pt-4">
            <Button 
              className="flex-1 bg-gradient-primary hover:shadow-glow"
              onClick={() => window.open('/profile', '_self')}
            >
              프로필 편집
            </Button>
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};