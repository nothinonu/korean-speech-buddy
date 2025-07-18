import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Camera, Save, Link, Gamepad2, Shield, Settings, Crown, Download, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  steam_id?: string;
  favorite_games?: string[];
  play_style?: string;
  level: number;
  is_premium: boolean;
  steam_profile_url?: string;
  steam_avatar_url?: string;
  steam_display_name?: string;
  steam_game_count?: number;
  steam_level?: number;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingSteam, setIsSyncingSteam] = useState(false);
  const [showSteamHelp, setShowSteamHelp] = useState(false);
  const [steamInput, setSteamInput] = useState('');
  const [steamInputType, setSteamInputType] = useState<'id' | 'url'>('id');
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    bio: "",
    steam_id: "",
    favorite_games: [] as string[],
    play_style: ""
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
      return;
    }
    
    if (user) {
      fetchProfile();
    }
  }, [user, loading]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('프로필 조회 오류:', error);
        toast({
          title: "오류",
          description: "프로필을 불러올 수 없습니다.",
          variant: "destructive"
        });
        return;
      }

      setProfile(data);
      setFormData({
        username: data.username || "",
        display_name: data.display_name || "",
        bio: data.bio || "",
        steam_id: data.steam_id || "",
        favorite_games: data.favorite_games || [],
        play_style: data.play_style || ""
      });
    } catch (error) {
      console.error('프로필 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          display_name: formData.display_name,
          bio: formData.bio,
          steam_id: formData.steam_id,
          favorite_games: formData.favorite_games,
          play_style: formData.play_style
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "성공",
        description: "프로필이 성공적으로 업데이트되었습니다."
      });
      
      await fetchProfile(); // 업데이트된 프로필 다시 가져오기
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      toast({
        title: "오류",
        description: "프로필 업데이트에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addFavoriteGame = (game: string) => {
    if (game && !formData.favorite_games.includes(game)) {
      setFormData({
        ...formData,
        favorite_games: [...formData.favorite_games, game]
      });
    }
  };

  const removeFavoriteGame = (gameToRemove: string) => {
    setFormData({
      ...formData,
      favorite_games: formData.favorite_games.filter(game => game !== gameToRemove)
    });
  };

  const extractSteamIdFromUrl = (url: string): string | null => {
    // Steam profile URL patterns
    const patterns = [
      /steamcommunity\.com\/id\/([^\/]+)/,
      /steamcommunity\.com\/profiles\/(\d+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const handleSteamOpenId = () => {
    toast({
      title: "Steam OpenID 로그인",
      description: "이 기능은 곧 추가될 예정입니다.",
    });
  };

  const handleSteamInput = () => {
    let steamId = steamInput.trim();
    
    if (steamInputType === 'url') {
      const extractedId = extractSteamIdFromUrl(steamId);
      if (!extractedId) {
        toast({
          title: "올바르지 않은 URL",
          description: "Steam 프로필 URL 형식이 올바르지 않습니다.",
          variant: "destructive"
        });
        return;
      }
      steamId = extractedId;
    }

    if (!steamId) {
      toast({
        title: "Steam 정보가 필요합니다",
        description: "Steam ID 또는 프로필 URL을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    // formData에 steam_id 설정
    setFormData({ ...formData, steam_id: steamId });
    setSteamInput('');
    
    // 자동으로 동기화 실행
    syncSteamProfile(steamId);
  };

  const syncSteamProfile = async (steamId?: string) => {
    const idToUse = steamId || formData.steam_id.trim();
    
    if (!idToUse) {
      toast({
        title: "스팀 ID가 필요합니다",
        description: "먼저 스팀 ID를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsSyncingSteam(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-steam-profile', {
        body: { steamId: idToUse }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        // 스팀 프로필 정보를 데이터베이스에 업데이트
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            ...data.steamProfile,
            steam_id: idToUse // 현재 입력된 steam_id도 함께 저장
          })
          .eq('id', user?.id);

        if (updateError) {
          throw updateError;
        }

        toast({
          title: "스팀 프로필 동기화 완료",
          description: "스팀 계정 정보를 성공적으로 불러왔습니다."
        });

        // 업데이트된 프로필 다시 가져오기
        await fetchProfile();
      } else {
        throw new Error(data.error || "스팀 프로필을 찾을 수 없습니다");
      }
    } catch (error: any) {
      console.error('스팀 프로필 동기화 오류:', error);
      toast({
        title: "동기화 실패",
        description: error.message || "스팀 프로필 동기화에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSyncingSteam(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">프로필 관리</h1>
          <p className="text-muted-foreground">프로필 정보를 수정하고 게임 설정을 관리하세요</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-primary">
              <User className="mr-2 h-4 w-4" />
              기본 정보
            </TabsTrigger>
            <TabsTrigger value="gaming" className="data-[state=active]:bg-gradient-accent">
              <Gamepad2 className="mr-2 h-4 w-4" />
              게임 설정
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-gradient-cyber">
              <Settings className="mr-2 h-4 w-4" />
              계정 설정
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">기본 프로필 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 프로필 이미지 */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20 border-2 border-primary">
                    <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={formData.username} />
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl">
                      {formData.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" className="border-primary text-primary">
                      <Camera className="mr-2 h-4 w-4" />
                      이미지 변경
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">JPG, PNG 파일만 가능합니다</p>
                  </div>
                </div>

                <Separator />

                {/* 사용자명 */}
                <div className="space-y-2">
                  <Label htmlFor="username">사용자명</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="게이머 태그를 입력하세요"
                  />
                </div>

                {/* 표시명 */}
                <div className="space-y-2">
                  <Label htmlFor="display_name">표시명</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="다른 유저들에게 표시될 이름"
                  />
                </div>

                {/* 자기소개 */}
                <div className="space-y-2">
                  <Label htmlFor="bio">자기소개</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="자신을 소개해보세요..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gaming" className="mt-6">
            <div className="space-y-6">
              {/* Steam 연동 */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    Steam 계정 연동
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Steam OpenID 로그인 */}
                  <div className="space-y-2">
                    <Label>빠른 연동</Label>
                    <Button 
                      onClick={handleSteamOpenId}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
                      </svg>
                      Steam으로 로그인하여 자동 연동
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Steam 계정으로 직접 로그인하여 자동으로 정보를 가져옵니다 (추천)
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 border-t border-border"></div>
                    <span className="text-xs text-muted-foreground">또는</span>
                    <div className="flex-1 border-t border-border"></div>
                  </div>

                  {/* 수동 입력 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label>수동 입력</Label>
                      <Collapsible open={showSteamHelp} onOpenChange={setShowSteamHelp}>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-0 h-auto text-xs text-muted-foreground hover:text-primary"
                          >
                            <HelpCircle className="mr-1 h-3 w-3" />
                            어떻게 확인하나요?
                            {showSteamHelp ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="p-3 bg-muted rounded-lg text-sm space-y-2">
                            <p className="font-medium">Steam ID 찾는 방법:</p>
                            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                              <li>Steam 클라이언트 실행 → 프로필 보기</li>
                              <li>웹브라우저에서 Steam 프로필 페이지 접속</li>
                              <li>URL에서 ID 부분 복사</li>
                            </ol>
                            <p className="font-medium mt-3">예시:</p>
                            <div className="bg-background p-2 rounded text-xs font-mono">
                              <p>• ID 형태: steamcommunity.com/id/<span className="text-primary">사용자명</span></p>
                              <p>• 숫자 형태: steamcommunity.com/profiles/<span className="text-primary">76561198...</span></p>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>

                    <div className="flex gap-2">
                      <Select value={steamInputType} onValueChange={(value: 'id' | 'url') => setSteamInputType(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="id">Steam ID</SelectItem>
                          <SelectItem value="url">프로필 URL</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={steamInput}
                        onChange={(e) => setSteamInput(e.target.value)}
                        placeholder={
                          steamInputType === 'id' 
                            ? "Steam ID 또는 사용자명" 
                            : "Steam 프로필 전체 URL"
                        }
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSteamInput}
                        disabled={isSyncingSteam || !steamInput.trim()}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                      >
                        {isSyncingSteam ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* 현재 연동된 Steam ID */}
                  {formData.steam_id && (
                    <div className="space-y-2">
                      <Label>현재 연동된 Steam ID</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={formData.steam_id}
                          onChange={(e) => setFormData({ ...formData, steam_id: e.target.value })}
                          placeholder="Steam ID"
                        />
                        <Button 
                          onClick={() => syncSteamProfile()}
                          disabled={isSyncingSteam || !formData.steam_id.trim()}
                          size="sm"
                          variant="outline"
                        >
                          {isSyncingSteam ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          ) : (
                            <Download className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {profile?.steam_profile_url && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium text-foreground mb-2">연동된 Steam 정보</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">표시명:</span> {profile.steam_display_name}</p>
                        <p><span className="text-muted-foreground">레벨:</span> {profile.steam_level}</p>
                        <p><span className="text-muted-foreground">보유 게임:</span> {profile.steam_game_count}개</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 게임 설정 */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">게임 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 플레이 스타일 */}
                  <div className="space-y-2">
                    <Label htmlFor="play_style">플레이 스타일</Label>
                    <Select value={formData.play_style} onValueChange={(value) => setFormData({ ...formData, play_style: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="플레이 스타일을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="경쟁적">경쟁적</SelectItem>
                        <SelectItem value="캐주얼">캐주얼</SelectItem>
                        <SelectItem value="혼합">혼합</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 선호 게임 */}
                  <div className="space-y-2">
                    <Label>선호 게임</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.favorite_games.map((game, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeFavoriteGame(game)}
                        >
                          {game} ×
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="게임 이름을 입력하세요"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addFavoriteGame(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          addFavoriteGame(input.value);
                          input.value = '';
                        }}
                      >
                        추가
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">Enter 키 또는 추가 버튼으로 게임을 추가할 수 있습니다</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">계정 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 계정 정보 */}
                <div className="space-y-4">
                  <div>
                    <Label>이메일</Label>
                    <Input value={user.email || ""} disabled className="bg-muted" />
                  </div>
                  
                  <div>
                    <Label>레벨</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-primary text-primary">
                        Lv.{profile?.level}
                      </Badge>
                      {profile?.is_premium && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900">
                          <Crown className="mr-1 h-3 w-3" />
                          프리미엄
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 보안 설정 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    보안 설정
                  </h3>
                  <Button variant="outline" className="w-full">
                    비밀번호 변경
                  </Button>
                  <Button variant="outline" className="w-full">
                    2단계 인증 설정
                  </Button>
                </div>

                <Separator />

                {/* 위험 영역 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-destructive">위험 영역</h3>
                  <Button variant="destructive" className="w-full">
                    계정 삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 저장 버튼 */}
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-primary text-primary-foreground hover:shadow-glow min-w-32"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                저장하기
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;