import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GameRequestData {
  name: string;
  description?: string;
  imageUrl?: string;
  playerCount: string;
  isCooperative: boolean;
  tags: string;
  steamAppId?: string;
  userEmail: string;
  userName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const gameData: GameRequestData = await req.json();
    
    // 관리자에게 알림 로그 기록
    console.log("=== 게임 추가 요청 ===");
    console.log("요청자:", gameData.userName, `(${gameData.userEmail})`);
    console.log("게임명:", gameData.name);
    console.log("설명:", gameData.description || "없음");
    console.log("플레이어 수:", gameData.playerCount);
    console.log("협동게임 여부:", gameData.isCooperative ? "예" : "아니오");
    console.log("태그:", gameData.tags || "없음");
    console.log("Steam App ID:", gameData.steamAppId || "없음");
    console.log("이미지 URL:", gameData.imageUrl || "없음");
    console.log("요청 시간:", new Date().toISOString());
    console.log("========================");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "게임 추가 요청이 관리자에게 전달되었습니다." 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("게임 추가 요청 처리 중 오류:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);