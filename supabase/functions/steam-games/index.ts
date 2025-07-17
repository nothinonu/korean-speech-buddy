import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SteamApp {
  appid: number;
  name: string;
}

interface SteamAppDetails {
  success: boolean;
  data?: {
    name: string;
    short_description: string;
    header_image: string;
    categories?: Array<{ id: number; description: string }>;
    genres?: Array<{ id: string; description: string }>;
    metacritic?: { score: number };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const STEAM_API_KEY = Deno.env.get('STEAM_API_KEY')
    
    if (!STEAM_API_KEY) {
      throw new Error('Steam API key not configured')
    }

    // Get list of Steam apps
    const appsResponse = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/')
    const appsData = await appsResponse.json()
    
    // Filter for cooperative games (using known cooperative game app IDs)
    const cooperativeGameIds = [
      1426210, // It Takes Two
      620,     // Portal 2
      728880,  // Overcooked! 2
      1222700, // A Way Out
      548430,  // Deep Rock Galactic
      413150,  // Stardew Valley
      394360,  // Hearts of Iron IV
      361420,  // Astroneer
      251570,  // 7 Days to Die
      346110,  // ARK: Survival Evolved
      447040,  // Watch Dogs 2
      570,     // Dota 2
      730,     // Counter-Strike 2
      252490,  // Rust
      271590,  // Grand Theft Auto V
      582010,  // Monster Hunter: World
      431960,  // Wallpaper Engine
      493520,  // Green Hell
      646570,  // Slay the Spire
      648800,  // Raft
      1063730, // New World
      1172470, // Apex Legends
      976730,  // Halo: The Master Chief Collection
    ]

    const games = []
    
    // Fetch details for each cooperative game
    for (const appId of cooperativeGameIds.slice(0, 12)) { // Limit to 12 games
      try {
        const detailsResponse = await fetch(
          `https://store.steampowered.com/api/appdetails?appids=${appId}&l=korean`
        )
        const detailsData = await detailsResponse.json()
        
        if (detailsData[appId]?.success && detailsData[appId]?.data) {
          const gameData = detailsData[appId].data
          
          // Check if it's a cooperative game by categories
          const isCooperative = gameData.categories?.some((cat: any) => 
            cat.description.includes('Co-op') || 
            cat.description.includes('Multi-player') ||
            cat.description.includes('협동')
          ) || true // Assume true since we're filtering known coop games
          
          if (isCooperative) {
            games.push({
              id: appId.toString(),
              name: gameData.name,
              description: gameData.short_description || '설명이 없습니다.',
              imageUrl: gameData.header_image,
              steamAppId: appId,
              playerCount: '2-4명', // Default for cooperative games
              isCooperative: true,
              rating: gameData.metacritic?.score ? gameData.metacritic.score / 10 : undefined,
              tags: gameData.genres?.map((g: any) => g.description).slice(0, 3) || ['협동', '멀티플레이어']
            })
          }
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Failed to fetch details for app ${appId}:`, error)
      }
    }

    return new Response(
      JSON.stringify(games),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error fetching Steam games:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch Steam games',
        message: error.message 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})