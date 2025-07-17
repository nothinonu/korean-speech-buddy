import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock } from "lucide-react";

interface GameCardProps {
  game: {
    id: string;
    name: string;
    image: string;
    playerCount: number;
    category: string;
    description: string;
    createdBy?: string;
    createdAt?: string;
  };
}

export const GameCard = ({ game }: GameCardProps) => {
  return (
    <Card className="bg-card border-border hover:shadow-glow transition-all duration-300 hover:scale-105">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground">{game.name}</CardTitle>
          <Badge variant="secondary" className="bg-gradient-primary text-primary-foreground">
            {game.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <img 
            src={game.image} 
            alt={game.name}
            className="w-full h-32 object-cover rounded-md"
          />
          <p className="text-sm text-muted-foreground">{game.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users size={16} />
              <span>{game.playerCount}명 플레이 중</span>
            </div>
            <Button 
              size="sm" 
              className="bg-gradient-accent text-accent-foreground hover:shadow-glow"
            >
              참여하기
            </Button>
          </div>
          {game.createdBy && game.createdAt && (
            <div className="text-xs text-muted-foreground mt-2">
              <span>{game.createdBy}</span> • <span>{new Date(game.createdAt).toLocaleDateString('ko-KR')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};