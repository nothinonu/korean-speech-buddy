import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Header } from '@/components/Header';
import { Plus, Search, Users, Star, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ScrollToTop from '@/components/ScrollToTop';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Game {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  steamAppId?: number;
  playerCount: string;
  isCooperative: boolean;
  rating?: number;
  tags: string[];
}

const Games = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [steamGames, setSteamGames] = useState<Game[]>([]);
  const [showSteamGames, setShowSteamGames] = useState(false);
  const [noSteamGame, setNoSteamGame] = useState(false);
  const [steamSearchTerm, setSteamSearchTerm] = useState('');
  const [showSteamSearch, setShowSteamSearch] = useState(false);
  const [gameForm, setGameForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    playerCount: '',
    isCooperative: false,
    tags: '',
    steamAppId: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('프로필을 불러오는데 실패했습니다:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('프로필을 불러오는데 실패했습니다:', error);
    }
  };

  const fetchGames = async () => {
    try {
      setLoading(true);
      // Fetch Steam games using Supabase client
      const { data: steamGames, error } = await supabase.functions.invoke('steam-games');
      
      if (error) {
        console.error('Steam API 호출 오류:', error);
        setGames(mockGames);
      } else if (steamGames) {
        setGames(steamGames);
      } else {
        setGames(mockGames);
      }
    } catch (error) {
      console.error('게임 목록을 불러오는데 실패했습니다:', error);
      // Load mock data as fallback
      setGames(mockGames);
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addCustomGame = () => {
    // 로그인 확인
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "게임을 추가하려면 먼저 로그인해주세요.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    // 스팀 ID 확인
    if (!profile?.steam_id) {
      toast({
        title: "스팀 계정 연동이 필요합니다",
        description: "게임을 추가하려면 프로필에서 스팀 계정을 연동해주세요.",
        variant: "destructive",
      });
      navigate('/profile');
      return;
    }

    // 모든 조건을 만족한 경우 모달 열기
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제 게임 추가 로직 구현
    console.log('게임 추가:', gameForm);
    toast({
      title: "게임이 추가되었습니다",
      description: `${gameForm.name}이(가) 성공적으로 추가되었습니다.`,
    });
    setIsModalOpen(false);
    // 폼 초기화
    setGameForm({
      name: '',
      description: '',
      imageUrl: '',
      playerCount: '',
      isCooperative: false,
      tags: '',
      steamAppId: ''
    });
  };

  const searchSteamGames = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSteamGames([]);
      setShowSteamGames(false);
      return;
    }

    try {
      const { data: steamGameData, error } = await supabase.functions.invoke('steam-games', {
        body: { search: searchQuery }
      });
      
      if (error) {
        console.error('스팀 게임 검색에 실패했습니다:', error);
        setSteamGames([]);
      } else if (steamGameData) {
        setSteamGames(steamGameData);
      } else {
        setSteamGames([]);
      }
      setShowSteamGames(true);
    } catch (error) {
      console.error('스팀 게임 검색에 실패했습니다:', error);
      setSteamGames([]);
      setShowSteamGames(true);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setGameForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">게임 목록</h1>
            <p className="text-muted-foreground">
              협동 게임을 찾아보고 새로운 게임을 추가해보세요
            </p>
          </div>
          <Button onClick={addCustomGame} className="mt-4 md:mt-0">
            <Plus className="mr-2" size={16} />
            게임 추가
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="게임 이름 또는 태그로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Games Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-muted rounded"></div>
                    <div className="h-6 w-20 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <Card key={game.id} className="group hover:shadow-glow transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <img
                    src={game.imageUrl}
                    alt={game.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {game.steamAppId && (
                    <Badge className="absolute top-2 right-2 bg-blue-600 text-white">
                      Steam
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-foreground line-clamp-1">
                      {game.name}
                    </h3>
                    {game.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-muted-foreground">
                          {game.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {game.description}
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <Users size={16} className="text-primary" />
                    <span className="text-sm text-foreground">{game.playerCount}</span>
                    {game.isCooperative && (
                      <Badge variant="secondary" className="text-xs">
                        협동
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {game.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      매칭 찾기
                    </Button>
                    {game.steamAppId && (
                      <Button size="sm" variant="outline" className="p-2">
                        <ExternalLink size={16} />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredGames.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 게임 추가 모달 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>새 게임 추가</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">게임 이름 *</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSteamSearch(true)}
                  className="flex-1"
                >
                  스팀에서 찾아보기
                </Button>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noSteamGame"
                    checked={noSteamGame}
                    onCheckedChange={(checked) => setNoSteamGame(!!checked)}
                  />
                  <Label htmlFor="noSteamGame" className="text-sm">찾는 게임이 없어요</Label>
                </div>
              </div>
              
              {showSteamSearch && !noSteamGame && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      placeholder="스팀 게임 검색..."
                      value={steamSearchTerm}
                      onChange={(e) => {
                        setSteamSearchTerm(e.target.value);
                        searchSteamGames(e.target.value);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
              
              {showSteamGames && !noSteamGame && (
                <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {steamGames.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                        onClick={() => {
                          handleInputChange('name', game.name);
                          handleInputChange('description', game.description || '');
                          handleInputChange('imageUrl', game.imageUrl || '');
                          handleInputChange('steamAppId', game.steamAppId);
                          setShowSteamGames(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {game.imageUrl && (
                            <img src={game.imageUrl} alt={game.name} className="w-8 h-8 rounded" />
                          )}
                          <span className="text-sm">{game.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {noSteamGame && (
                <Input
                  id="name"
                  value={gameForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="게임 이름을 입력하세요"
                  required
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">게임 설명</Label>
              <Textarea
                id="description"
                value={gameForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="게임에 대한 간단한 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">이미지 URL</Label>
              <Input
                id="imageUrl"
                value={gameForm.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                placeholder="게임 이미지 URL을 입력하세요"
                type="url"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="playerCount">플레이어 수 *</Label>
              <Input
                id="playerCount"
                value={gameForm.playerCount}
                onChange={(e) => handleInputChange('playerCount', e.target.value)}
                placeholder="예: 1-4명, 2명, 온라인 멀티플레이어"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="steamAppId">스팀 앱 ID (선택사항)</Label>
              <Input
                id="steamAppId"
                value={gameForm.steamAppId}
                onChange={(e) => handleInputChange('steamAppId', e.target.value)}
                placeholder="스팀 게임의 앱 ID (숫자)"
                type="number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">태그</Label>
              <Input
                id="tags"
                value={gameForm.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="태그를 쉼표로 구분해서 입력 (예: 협동, FPS, 어드벤처)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isCooperative"
                checked={gameForm.isCooperative}
                onCheckedChange={(checked) => handleInputChange('isCooperative', checked)}
              />
              <Label htmlFor="isCooperative">협동 게임</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsModalOpen(false)}
              >
                취소
              </Button>
              <Button type="submit" className="flex-1">
                게임 추가
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ScrollToTop />
    </div>
  );
};

// Mock data for fallback
const mockGames: Game[] = [
  {
    id: '1',
    name: 'It Takes Two',
    description: '두 명이 함께 플레이하는 협동 어드벤처 게임',
    imageUrl: '/placeholder.svg',
    steamAppId: 1426210,
    playerCount: '2명',
    isCooperative: true,
    rating: 4.8,
    tags: ['협동', '어드벤처', '퍼즐']
  },
  {
    id: '2',
    name: 'Portal 2',
    description: '물리학 기반 퍼즐 게임의 협동 모드',
    imageUrl: '/placeholder.svg',
    steamAppId: 620,
    playerCount: '2명',
    isCooperative: true,
    rating: 4.9,
    tags: ['퍼즐', '1인칭', '협동']
  },
  {
    id: '3',
    name: 'Overcooked! 2',
    description: '요리 시뮬레이션 협동 게임',
    imageUrl: '/placeholder.svg',
    steamAppId: 728880,
    playerCount: '1-4명',
    isCooperative: true,
    rating: 4.6,
    tags: ['요리', '파티', '협동']
  },
  {
    id: '4',
    name: 'A Way Out',
    description: '탈옥을 다룬 협동 액션 어드벤처',
    imageUrl: '/placeholder.svg',
    steamAppId: 1222700,
    playerCount: '2명',
    isCooperative: true,
    rating: 4.5,
    tags: ['액션', '협동', '스토리']
  },
  {
    id: '5',
    name: 'Deep Rock Galactic',
    description: '우주 광부들의 협동 FPS',
    imageUrl: '/placeholder.svg',
    steamAppId: 548430,
    playerCount: '1-4명',
    isCooperative: true,
    rating: 4.7,
    tags: ['FPS', '협동', 'SF']
  },
  {
    id: '6',
    name: 'Stardew Valley',
    description: '농장 시뮬레이션 게임',
    imageUrl: '/placeholder.svg',
    steamAppId: 413150,
    playerCount: '1-4명',
    isCooperative: true,
    rating: 4.8,
    tags: ['농장', '시뮬레이션', '협동']
  }
];

export default Games;