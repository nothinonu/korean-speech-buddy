import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Security-Policy": "default-src 'self'",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { steamId } = await req.json();
    const steamApiKey = Deno.env.get("STEAM_API_KEY");

    if (!steamApiKey) {
      return new Response(
        JSON.stringify({ error: "Steam API key not configured" }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    if (!steamId) {
      return new Response(
        JSON.stringify({ error: "Steam ID is required" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Steam ID 형식 검증
    const steamId64Regex = /^7656119[0-9]{10}$/;
    if (!steamId64Regex.test(steamId)) {
      return new Response(
        JSON.stringify({ error: "Invalid Steam ID format" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Steam API 호출
    const steamResponse = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`
    );

    if (!steamResponse.ok) {
      throw new Error("Failed to fetch Steam profile");
    }

    const steamData = await steamResponse.json();
    const player = steamData.response.players[0];

    if (!player) {
      return new Response(
        JSON.stringify({ error: "Steam profile not found" }),
        { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // 게임 개수 가져오기
    const gamesResponse = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamApiKey}&steamid=${steamId}&format=json`
    );

    let gameCount = 0;
    if (gamesResponse.ok) {
      const gamesData = await gamesResponse.json();
      gameCount = gamesData.response?.game_count || 0;
    }

    // Steam 레벨 가져오기
    const levelResponse = await fetch(
      `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${steamApiKey}&steamid=${steamId}`
    );

    let steamLevel = 0;
    if (levelResponse.ok) {
      const levelData = await levelResponse.json();
      steamLevel = levelData.response?.player_level || 0;
    }

    const steamProfileData = {
      steam_id: steamId,
      steam_profile_url: player.profileurl,
      steam_avatar_url: player.avatarfull,
      steam_display_name: player.personaname,
      steam_game_count: gameCount,
      steam_level: steamLevel,
      steam_last_sync: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        steamProfile: steamProfileData 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error syncing Steam profile:", error);
    return new Response(
      JSON.stringify({ error: "Failed to sync Steam profile" }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});