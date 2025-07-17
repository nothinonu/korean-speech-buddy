import { useState } from "react";
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
import { Toaster } from "@/components/ui/toaster";
import { Search, Gamepad2, Users, MessageSquare } from "lucide-react";
import heroImage from "@/assets/gaming-hero.jpg";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");

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
      username: "GamerKR123",
      steamId: "steamkr123",
      avatar: "/placeholder.svg",
      level: 42,
      favoriteGames: ["CS2", "발로란트", "에이펙스"],
      playStyle: "경쟁적",
      isOnline: true,
      description: "저녁 시간대 주로 플레이, 친근한 분위기 선호"
    },
    {
      id: "2",
      username: "TeamPlayer98",
      steamId: "teamplay98",
      avatar: "/placeholder.svg",
      level: 35,
      favoriteGames: ["롤", "오버워치", "데스티니2"],
      playStyle: "캐주얼",
      isOnline: false,
      description: "팀워크 중시, 재미있게 게임하실 분들 환영!"
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
        <div className="relative z-10 text-center space-y-6 px-4">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            한국 스팀 <span className="bg-gradient-primary bg-clip-text text-transparent">게이머 커뮤니티</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            같이 게임할 친구를 찾고, 소통하고, 함께 즐겨보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input 
                placeholder="게임 또는 플레이어 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Button className="bg-gradient-accent text-accent-foreground hover:shadow-glow">
              검색
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-card border-border text-center hover:shadow-glow transition-all">
            <CardContent className="pt-6">
              <Gamepad2 size={32} className="mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">{mockGames.length}</h3>
              <p className="text-muted-foreground">인기 게임</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border text-center hover:shadow-glow transition-all">
            <CardContent className="pt-6">
              <Users size={32} className="mx-auto mb-4 text-secondary" />
              <h3 className="text-2xl font-bold text-foreground">{mockPlayers.length * 1000}+</h3>
              <p className="text-muted-foreground">활성 플레이어</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border text-center hover:shadow-glow transition-all">
            <CardContent className="pt-6">
              <MessageSquare size={32} className="mx-auto mb-4 text-accent" />
              <h3 className="text-2xl font-bold text-foreground">{mockChannels.length * 10}</h3>
              <p className="text-muted-foreground">활성 채널</p>
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
              활성 플레이어
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
              <h2 className="text-2xl font-bold text-foreground">활성 플레이어</h2>
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
      <Toaster />
    </AuthProvider>
  );
};

export default Index;