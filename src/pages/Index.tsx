import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameCard } from "@/components/GameCard";
import { PlayerProfile } from "@/components/PlayerProfile";
import { GameChannels } from "@/components/GameChannels";
import { AdBanner } from "@/components/AdBanner";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/hooks/useAuth";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/toaster";
import { Search, Gamepad2, Users, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/gaming-hero.jpg";
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [gameCount, setGameCount] = useState(150);
  const navigate = useNavigate();

  useEffect(() => {
    const loadGameData = async () => {
      try {
        // 게임 수 조회
        const { count, error } = await supabase
          .from('games')
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          throw error;
        }
        
        // 30개 이상의 게임이 없으면 먼저 협동게임 불러오기
        if (!count || count < 30) {
          await loadCooperativeGames();
          
          // 다시 게임 수 조회
          const { count: newCount } = await supabase
            .from('games')
            .select('*', { count: 'exact', head: true });
            
          setGameCount(newCount || 30);
        } else {
          setGameCount(count);
        }
      } catch (error) {
        console.log('게임 데이터를 불러오지 못했습니다:', error);
        setGameCount(30);
      }
    };
    loadGameData();
  }, []);

  const loadCooperativeGames = async () => {
    try {
      const { data: steamGameData, error } = await supabase.functions.invoke('steam-games', {
        body: { loadCoopGames: true }
      });
      
      if (error) {
        console.error('협동게임 불러오기에 실패했습니다:', error);
      } else if (steamGameData && steamGameData.length > 0) {
        // 스팀에서 가져온 협동게임들을 데이터베이스에 저장
        const gameInserts = steamGameData.map((game: any) => ({
          name: game.name,
          description: game.description || '',
          image_url: game.imageUrl || null,
          steam_app_id: game.steamAppId,
          player_count: game.playerCount,
          is_cooperative: true,
          tags: game.tags || [],
          created_by: null
        }));

        // 기존에 동일한 steam_app_id가 있는지 확인하고 없는 것만 추가
        for (const gameData of gameInserts) {
          if (gameData.steam_app_id) {
            const { data: existingGame } = await supabase
              .from('games')
              .select('id')
              .eq('steam_app_id', gameData.steam_app_id)
              .maybeSingle();
            
            if (!existingGame) {
              await supabase.from('games').insert([gameData]);
            }
          }
        }
      }
    } catch (error) {
      console.error('협동게임 불러오기에 실패했습니다:', error);
    }
  };

  // Mock data for demonstration
  const mockGames = [
    {
      id: "1",
      name: "카운터 스트라이크 2",
      image: "/placeholder.svg",
      playerCount: 1245,
      category: "FPS",
      description: "전술적 팀 기반 슈터 게임"
    },
    {
      id: "2", 
      name: "발로란트",
      image: "/placeholder.svg",
      playerCount: 892,
      category: "FPS",
      description: "캐릭터 기반 택티컬 슈터"
    },
    {
      id: "3",
      name: "리그 오브 레전드",
      image: "/placeholder.svg", 
      playerCount: 2156,
      category: "MOBA",
      description: "5v5 전략 게임"
    }
  ];

  const mockPlayers = [
    {
      id: "1",
      username: "ProGamer_KR",
      steamId: "progamer_kr",
      avatar: "/placeholder.svg",
      level: 68,
      favoriteGames: ["CS2", "발로란트"],
      playStyle: "경쟁적",
      isOnline: true,
      description: "🔥 지금 CS2 랭크 게임 함께할 분 구해요! 골드 이상 환영"
    },
    {
      id: "2",
      username: "FriendlyGamer",
      steamId: "friendly_gamer",
      avatar: "/placeholder.svg",
      level: 35,
      favoriteGames: ["롤", "발로란트", "에이펙스"],
      playStyle: "캐주얼",
      isOnline: true,
      description: "😊 재미있게 게임하실 분들! 초보도 환영합니다"
    },
    {
      id: "3",
      username: "NightOwl_Player",
      steamId: "nightowl_player",
      avatar: "/placeholder.svg",
      level: 52,
      favoriteGames: ["롤", "오버워치"],
      playStyle: "경쟁적",
      isOnline: true,
      description: "🌙 밤 시간대 활동! 롤 다이아 / 오버워치 마스터"
    },
    {
      id: "4",
      username: "TeamworkFirst",
      steamId: "teamwork_first",
      avatar: "/placeholder.svg",
      level: 41,
      favoriteGames: ["CS2", "에이펙스", "데스티니2"],
      playStyle: "팀워크",
      isOnline: true,
      description: "🤝 팀워크 중시! 소통 잘하시는 분들과 함께 플레이해요"
    },
    {
      id: "5",
      username: "CasualFun",
      steamId: "casual_fun",
      avatar: "/placeholder.svg",
      level: 28,
      favoriteGames: ["마인크래프트", "포트나이트"],
      playStyle: "캐주얼",
      isOnline: false,
      description: "🎮 가볍게 즐기는 게임! 스트레스 받지 말고 재미있게"
    },
    {
      id: "6",
      username: "SkillSeeker",
      steamId: "skill_seeker",
      avatar: "/placeholder.svg",
      level: 73,
      favoriteGames: ["롤", "CS2", "발로란트"],
      playStyle: "성장지향",
      isOnline: true,
      description: "📈 함께 실력 향상해요! 피드백 주고받으며 성장하실 분"
    }
  ];

  const mockChannels = [
    {
      id: "1",
      name: "CS2 한국 서버",
      game: "카운터 스트라이크 2",
      memberCount: 3421,
      onlineCount: 234,
      category: "인기" as const,
      description: "한국 CS2 플레이어들의 메인 채널",
      isOfficial: true
    },
    {
      id: "2",
      name: "발로란트 랭크팟",
      game: "발로란트", 
      memberCount: 1893,
      onlineCount: 156,
      category: "추천" as const,
      description: "랭크 게임 파티 모집 전용",
      isOfficial: false
    },
    {
      id: "3",
      name: "롤 칼바람 모임",
      game: "리그 오브 레전드",
      memberCount: 956,
      onlineCount: 78,
      category: "신규" as const,
      description: "칼바람 나락 함께할 분들",
      isOfficial: false
    }
  ];

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background relative">
        {/* Header */}
        <Header />
      {/* Left Ad Banner */}
      <div className="hidden xl:block">
        <div className="left-0">
          <AdBanner position="left" />
        </div>
      </div>

      {/* Right Ad Banner */}
      <div className="hidden xl:block">
        <div className="right-0">
          <AdBanner position="right" />
        </div>
      </div>

      {/* Main Content */}
        <div className="xl:mx-64"> {/* 양쪽 광고 공간만큼 마진 */}
      {/* Hero Section */}
      <div 
        className="relative h-96 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background"></div>
        <div className="relative z-10 text-center space-y-6 px-4 animate-fade-in">
          <h1 className="text-6xl font-gaming font-black text-foreground mb-4 animate-scale-in hover-scale tracking-wide">
            <span className="inline-block animate-fade-in">게임 메이트</span>{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent inline-block animate-fade-in [animation-delay:0.2s] hover:animate-pulse">
              매칭 플랫폼
            </span>
          </h1>
          <p className="text-xl font-modern font-light text-muted-foreground mb-8 animate-fade-in [animation-delay:0.4s] leading-relaxed">
            취향이 맞는 게이머를 찾아 함께 플레이하고 <br className="hidden sm:block" />
            <span className="font-semibold text-foreground">새로운 친구</span>를 만나보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto animate-fade-in [animation-delay:0.6s]">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors" size={20} />
              <Input 
                placeholder="플레이어 또는 원하는 게임 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card/80 border-border font-modern hover:bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/50"
              />
            </div>
            <Button className="bg-gradient-accent text-accent-foreground hover:shadow-glow font-modern font-semibold transform hover:scale-105 transition-all duration-300 hover:-translate-y-1">
              매칭 찾기
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card 
            className="bg-card border-border text-center hover:shadow-glow transition-all cursor-pointer"
            onClick={() => navigate('/games')}
          >
            <CardContent className="pt-6">
              <Gamepad2 size={32} className="mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">{gameCount}+</h3>
              <p className="text-muted-foreground">매칭 가능한 게임</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border text-center hover:shadow-glow transition-all">
            <CardContent className="pt-6">
              <Users size={32} className="mx-auto mb-4 text-secondary" />
              <h3 className="text-2xl font-bold text-foreground">2,500+</h3>
              <p className="text-muted-foreground">매칭 대기 중인 플레이어</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border text-center hover:shadow-glow transition-all">
            <CardContent className="pt-6">
              <MessageSquare size={32} className="mx-auto mb-4 text-accent" />
              <h3 className="text-2xl font-bold text-foreground">1,200+</h3>
              <p className="text-muted-foreground">오늘 성사된 매칭</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="games" className="data-[state=active]:bg-gradient-primary">
              인기 게임
            </TabsTrigger>
            <TabsTrigger value="players" className="data-[state=active]:bg-gradient-accent">
              매칭 대기 중
            </TabsTrigger>
            <TabsTrigger value="channels" className="data-[state=active]:bg-gradient-cyber">
              게임 채널
            </TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="mt-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">인기 게임</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="players" className="mt-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">매칭을 원하는 플레이어</h2>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  필터 설정
                </Button>
              </div>
              <p className="text-muted-foreground">지금 게임을 함께할 플레이어들을 찾아보세요</p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {mockPlayers.map((player) => (
                  <PlayerProfile key={player.id} player={player} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="channels" className="mt-8">
            <GameChannels channels={mockChannels} />
          </TabsContent>
        </Tabs>
        </div>
        </div>
      </div>
      <ScrollToTop />
      <Toaster />
    </AuthProvider>
  );
};

export default Index;