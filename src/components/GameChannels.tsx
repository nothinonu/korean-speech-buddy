import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Crown } from "lucide-react";

interface GameChannel {
  id: string;
  name: string;
  game: string;
  memberCount: number;
  onlineCount: number;
  category: "인기" | "신규" | "추천";
  description: string;
  isOfficial: boolean;
}

interface GameChannelsProps {
  channels: GameChannel[];
}

export const GameChannels = ({ channels }: GameChannelsProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "인기": return "bg-gradient-primary";
      case "신규": return "bg-gradient-accent";
      case "추천": return "bg-gradient-cyber";
      default: return "bg-secondary";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground mb-6">게임 채널</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel) => (
          <Card key={channel.id} className="bg-card border-border hover:shadow-glow transition-all duration-300 hover:scale-105">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg text-foreground">{channel.name}</CardTitle>
                  {channel.isOfficial && (
                    <Crown size={16} className="text-accent" />
                  )}
                </div>
                <Badge className={`${getCategoryColor(channel.category)} text-primary-foreground`}>
                  {channel.category}
                </Badge>
              </div>
              <p className="text-sm text-primary font-medium">{channel.game}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{channel.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users size={14} />
                    <span>{channel.memberCount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-accent">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span>{channel.onlineCount} 온라인</span>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-accent text-accent-foreground hover:shadow-glow"
                size="sm"
              >
                <MessageSquare size={14} className="mr-2" />
                채널 입장
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};