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
    
    // Filter for cooperative and online multiplayer games
    const popularGameIds = [
      // Cooperative games
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
      648800,  // Raft
      493520,  // Green Hell
      
      // Online multiplayer games
      730,     // Counter-Strike 2
      570,     // Dota 2
      1172470, // Apex Legends
      271590,  // Grand Theft Auto V
      1085660, // Destiny 2
      359550,  // Tom Clancy's Rainbow Six Siege
      252490,  // Rust
      1091500, // Cyberpunk 2077
      976730,  // Halo: The Master Chief Collection
      1063730, // New World
      1174180, // Red Dead Redemption 2
      582010,  // Monster Hunter: World
      377160,  // Fall Guys
      863550,  // Among Us
      1097150, // Fall Guys: Ultimate Knockout
      892970,  // Valheim
      755790,  // Ring of Elysium
      578080,  // PUBG: BATTLEGROUNDS
    ]

    const games = []
    
    // Fetch details for each game
    for (const appId of popularGameIds) { // Get all games in the list
      try {
        const detailsResponse = await fetch(
          `https://store.steampowered.com/api/appdetails?appids=${appId}&l=korean`
        )
        const detailsData = await detailsResponse.json()
        
        if (detailsData[appId]?.success && detailsData[appId]?.data) {
          const gameData = detailsData[appId].data
          
          // Check if it's a multiplayer or cooperative game
          const isMultiplayer = gameData.categories?.some((cat: any) => 
            cat.description.includes('Co-op') || 
            cat.description.includes('Multi-player') ||
            cat.description.includes('협동') ||
            cat.description.includes('Online') ||
            cat.description.includes('PvP')
          ) || true // Assume true since we're filtering known multiplayer games
          
          if (isMultiplayer) {
            const isCooperative = gameData.categories?.some((cat: any) => 
              cat.description.includes('Co-op') || 
              cat.description.includes('협동')
            ) || [1426210, 620, 728880, 1222700, 548430, 413150, 394360, 361420, 251570, 346110, 648800, 493520].includes(appId);
            
            games.push({
              id: appId.toString(),
              name: gameData.name,
              description: gameData.short_description || '설명이 없습니다.',
              imageUrl: gameData.header_image,
              steamAppId: appId,
              playerCount: isCooperative ? '2-4명' : '온라인 멀티플레이어',
              isCooperative: isCooperative,
              rating: gameData.metacritic?.score ? gameData.metacritic.score / 10 : undefined,
              tags: gameData.genres?.map((g: any) => g.description).slice(0, 3) || (isCooperative ? ['협동', '멀티플레이어'] : ['온라인', '멀티플레이어'])
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