import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Gamepad2, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SteamProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
}

interface SteamProfileData {
  steam_id: string | null;
  username: string;
  favorite_games: string[];
  play_style: string;
  level: number;
}

export const SteamProfileModal = ({ isOpen, onClose, playerId }: SteamProfileModalProps) => {
  const [profileData, setProfileData] = useState<SteamProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && playerId) {
      fetchPlayerProfile();
    }
  }, [isOpen, playerId]);

  const fetchPlayerProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('steam_id, username, favorite_games, play_style, level')
        .eq('id', playerId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfileData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openSteamProfile = () => {
    if (profileData?.steam_id) {
      window.open(`https://steamcommunity.com/profiles/${profileData.steam_id}`, '_blank');
    }
  };

  const addSteamFriend = () => {
    if (profileData?.steam_id) {
      window.open(`steam://friends/add/${profileData.steam_id}`, '_blank');
    }
  };

  const validateSteamId = (steamId: string): boolean => {
    // Steam ID 64-bit 형식 검증 (17자리 숫자)
    const steamId64Regex = /^7656119[0-9]{10}$/;
    return steamId64Regex.test(steamId);
  };

  const syncSteamProfile = async () => {
    if (!profileData?.steam_id) return;
    
    if (!validateSteamId(profileData.steam_id)) {
      console.error('유효하지 않은 Steam ID 형식입니다.');
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('sync-steam-profile', {
        body: { steam_id: profileData.steam_id }
      });
      
      if (error) {
        console.error('Steam 프로필 동기화 오류:', error);
        return;
      }
      
      // 동기화 후 프로필 데이터 다시 가져오기
      await fetchPlayerProfile();
    } catch (error) {
      console.error('Steam 프로필 동기화 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-background border-border">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!profileData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-background border-border">
          <div className="text-center p-8">
            <p className="text-muted-foreground">프로필을 찾을 수 없습니다.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">플레이어 프로필</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 기본 프로필 정보 */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                {profileData.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-foreground">
                {profileData.username}
              </h3>
              <p className="text-muted-foreground">@{profileData.username}</p>
              {profileData.level > 0 && (
                <Badge variant="outline" className="mt-1 border-primary text-primary">
                  Lv.{profileData.level}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Steam 정보 */}
          {profileData.steam_id ? (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-foreground flex items-center gap-2">
                <Gamepad2 size={20} className="text-primary" />
                Steam 프로필
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                  <Users className="mx-auto mb-2 text-primary" size={24} />
                  <p className="text-sm text-muted-foreground">레벨</p>
                  <p className="text-xl font-semibold text-foreground">
                    {profileData.level}
                  </p>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4 text-center">
                  <Clock className="mx-auto mb-2 text-primary" size={24} />
                  <p className="text-sm text-muted-foreground">플레이 스타일</p>
                  <Badge className="bg-gradient-cyber text-accent-foreground">
                    {profileData.play_style}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={addSteamFriend}
                  className="flex-1 bg-gradient-accent hover:shadow-glow"
                >
                  <Users size={16} className="mr-2" />
                  Steam 친구 추가
                </Button>
                <Button 
                  onClick={openSteamProfile}
                  variant="outline"
                  className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <ExternalLink size={16} className="mr-2" />
                  Steam 프로필 보기
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Gamepad2 className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">Steam 프로필이 연동되지 않았습니다.</p>
            </div>
          )}

          <Separator />

          {/* 선호 게임 */}
          <div>
            <h4 className="text-lg font-medium text-foreground mb-3">선호 게임</h4>
            <div className="flex flex-wrap gap-2">
              {profileData.favorite_games?.map((game, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {game}
                </Badge>
              )) || <p className="text-muted-foreground">등록된 선호 게임이 없습니다.</p>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};