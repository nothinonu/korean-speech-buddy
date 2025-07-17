import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Gamepad2, Headphones, Monitor } from "lucide-react";

interface AdBannerProps {
  position: "left" | "right";
}

export const AdBanner = ({ position }: AdBannerProps) => {
  const leftAds = [
    {
      id: "gaming-gear",
      title: "게이밍 기어 할인",
      description: "최신 게이밍 키보드 & 마우스",
      discount: "최대 40% 할인",
      image: "/placeholder.svg",
      link: "#",
      color: "bg-gradient-primary"
    },
    {
      id: "headset",
      title: "프리미엄 헤드셋",
      description: "7.1 채널 서라운드 사운드",
      discount: "신제품 출시",
      image: "/placeholder.svg", 
      link: "#",
      color: "bg-gradient-accent"
    }
  ];

  const rightAds = [
    {
      id: "monitor",
      title: "게이밍 모니터",
      description: "144Hz 고주사율 모니터",
      discount: "특가 진행중",
      image: "/placeholder.svg",
      link: "#",
      color: "bg-gradient-cyber"
    },
    {
      id: "pc-parts", 
      title: "PC 부품 세트",
      description: "고성능 그래픽카드 + CPU",
      discount: "번들 할인",
      image: "/placeholder.svg",
      link: "#",
      color: "bg-gradient-primary"
    }
  ];

  const ads = position === "left" ? leftAds : rightAds;

  const getIcon = (id: string) => {
    switch (id) {
      case "gaming-gear": return <Gamepad2 size={20} />;
      case "headset": return <Headphones size={20} />;
      case "monitor": return <Monitor size={20} />;
      default: return <Gamepad2 size={20} />;
    }
  };

  return (
    <div className="w-64 fixed top-20 h-screen overflow-y-auto hide-scrollbar">
      <div className="space-y-4 p-4">
        <h3 className="text-sm font-medium text-muted-foreground text-center">
          스폰서 광고
        </h3>
        
        {ads.map((ad) => (
          <Card 
            key={ad.id} 
            className="bg-card border-border hover:shadow-glow transition-all duration-300 cursor-pointer group"
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-md ${ad.color} text-primary-foreground`}>
                    {getIcon(ad.id)}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    AD
                  </Badge>
                </div>
                
                <img 
                  src={ad.image}
                  alt={ad.title}
                  className="w-full h-24 object-cover rounded-md"
                />
                
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground text-sm leading-tight">
                    {ad.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {ad.description}
                  </p>
                  <Badge className={`${ad.color} text-primary-foreground text-xs`}>
                    {ad.discount}
                  </Badge>
                </div>
                
                <Button 
                  size="sm" 
                  className="w-full text-xs bg-gradient-accent text-accent-foreground hover:shadow-glow group-hover:scale-105 transition-transform"
                >
                  <ExternalLink size={12} className="mr-1" />
                  자세히 보기
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* 간단한 텍스트 광고 */}
        <Card className="bg-muted/30 border-dashed border-muted-foreground/30">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">
              여기에 광고를
              <br />
              게재하고 싶으신가요?
            </p>
            <Button variant="outline" size="sm" className="mt-2 text-xs">
              문의하기
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};