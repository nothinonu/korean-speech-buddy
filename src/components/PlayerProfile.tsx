import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Gamepad2, MessageCircle, UserPlus } from "lucide-react";

interface PlayerProfileProps {
  player: {
    id: string;
    username: string;
    steamId: string;
    avatar: string;
    level: number;
    favoriteGames: string[];
    playStyle: string;
    isOnline: boolean;
    description: string;
  };
}

export const PlayerProfile = ({ player }: PlayerProfileProps) => {
  return (
    <Card className="bg-card border-border hover:shadow-card transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src={player.avatar} alt={player.username} />
              <AvatarFallback className="bg-gradient-primary">
                {player.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {player.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-background"></div>
            )}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg text-foreground">{player.username}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gamepad2 size={14} />
              <span>{player.steamId}</span>
            </div>
          </div>
          <Badge variant="outline" className="border-primary text-primary">
            Lv.{player.level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{player.description}</p>
        
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">선호 게임</h4>
          <div className="flex flex-wrap gap-1">
            {player.favoriteGames.map((game, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {game}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-foreground mb-1">플레이 스타일</h4>
          <Badge className="bg-gradient-cyber text-accent-foreground">
            {player.playStyle}
          </Badge>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1 bg-gradient-accent">
            <MessageCircle size={14} className="mr-1" />
            채팅
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <UserPlus size={14} className="mr-1" />
            친구추가
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};