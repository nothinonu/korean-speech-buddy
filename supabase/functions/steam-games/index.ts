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

    // Get search term from request body or use cooperative games
    const body = await req.json().catch(() => ({}))
    const searchTerm = body.search || ''
    const loadCoopGames = body.loadCoopGames || false

    let filteredApps: SteamApp[] = []
    
    if (loadCoopGames) {
      // Load popular cooperative games directly
      const coopGameAppIds = [
        1091500, // Cyberpunk 2077
        570, // Dota 2
        730, // Counter-Strike 2
        440, // Team Fortress 2
        271590, // Grand Theft Auto V
        1172470, // Apex Legends
        1203220, // NARAKA: BLADEPOINT
        231430, // Company of Heroes 2
        304930, // Unturned
        553850, // HELLDIVERS 2
        1406990, // VALHEIM
        892970, // ELDEN RING
        646570, // Slay the Spire
        293780, // War Thunder
        252490, // Rust
        413150, // Stardew Valley
        1240440, // Halo Infinite
        1938090, // Call of Duty: Warzone 2.0
        289070, // Sid Meier's Civilization VI
        236850, // Europa Universalis IV
        1073600, // DEAD BY DAYLIGHT
        275850, // No Man's Sky
        1581630, // Golf With Your Friends
        863550, // The Forest
        556450, // Hearthstone
        632360, // Risk of Rain 2
        1203220, // NARAKA: BLADEPOINT
        578080, // PLAYERUNKNOWN'S BATTLEGROUNDS
        238460, // BattleBlock Theater
        620, // Portal 2
        322330, // Don't Starve Together
        431960, // Wallpaper Engine
        513710, // Payday 2
        1091500, // Cyberpunk 2077
        570940, // DARK SOULS III
        570, // Dota 2
        105600, // Terraria
        230410, // Warframe
        730, // Counter-Strike 2
        550, // Left 4 Dead 2
        440, // Team Fortress 2
        271590, // Grand Theft Auto V
        1172470, // Apex Legends
        1938090, // Call of Duty: Warzone 2.0
        391540, // Undertale
        812140, // A Hat in Time
        553850, // HELLDIVERS 2
        976730, // Halo: The Master Chief Collection
        1406990, // VALHEIM
        1774580, // SPIDER-MAN REMASTERED
        413150, // Stardew Valley
        1203220, // NARAKA: BLADEPOINT
        211820, // Starbound
        294100, // RimWorld
        377160, // Fallout 4
        251570, // 7 Days to Die
        8930, // Sid Meier's Civilization V
        289070, // Sid Meier's Civilization VI
        236850, // Europa Universalis IV
        200710, // Torchlight II
        252490, // Rust
        275850, // No Man's Sky
        1091500, // Cyberpunk 2077
        863550, // The Forest
        578080, // PLAYERUNKNOWN'S BATTLEGROUNDS
        238460, // BattleBlock Theater
        620, // Portal 2
        322330, // Don't Starve Together
        431960, // Wallpaper Engine
        513710, // Payday 2
        1091500, // Cyberpunk 2077
        570940, // DARK SOULS III
        570, // Dota 2
        105600, // Terraria
        230410, // Warframe
        730, // Counter-Strike 2
        550, // Left 4 Dead 2
        440, // Team Fortress 2
        271590, // Grand Theft Auto V
        1172470 // Apex Legends
      ];
      
      // Create app objects for these known cooperative games
      filteredApps = coopGameAppIds.slice(0, 30).map(appid => ({ appid, name: '' }));
    } else if (searchTerm.trim()) {
      // Get list of Steam apps
      const appsResponse = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/')
      const appsData = await appsResponse.json()
      
      // Filter apps by search term (case insensitive)
      filteredApps = appsData.applist.apps
        .filter((app: SteamApp) => 
          app.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 20) // Limit to first 20 results to avoid rate limiting
    } else {
      return new Response(
        JSON.stringify([]),
        {
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    const games = []
    
    // Fetch details for each game
    for (const app of filteredApps) {
      try {
        const detailsResponse = await fetch(
          `https://store.steampowered.com/api/appdetails?appids=${app.appid}&l=korean`
        )
        const detailsData = await detailsResponse.json()
        
        if (detailsData[app.appid]?.success && detailsData[app.appid]?.data) {
          const gameData = detailsData[app.appid].data
          
          // Skip if it's DLC or not a game
          if (gameData.type !== 'game') {
            continue
          }
          
          const isCooperative = gameData.categories?.some((cat: any) => 
            cat.description.includes('Co-op') || 
            cat.description.includes('협동')
          ) || false
          
          const isMultiplayer = gameData.categories?.some((cat: any) => 
            cat.description.includes('Multi-player') ||
            cat.description.includes('Online') ||
            cat.description.includes('PvP')
          ) || isCooperative
          
          games.push({
            id: app.appid.toString(),
            name: gameData.name,
            description: gameData.short_description || '설명이 없습니다.',
            imageUrl: gameData.header_image,
            steamAppId: app.appid,
            playerCount: isCooperative ? '2-4명' : (isMultiplayer ? '온라인 멀티플레이어' : '싱글플레이어'),
            isCooperative: isCooperative,
            rating: gameData.metacritic?.score ? gameData.metacritic.score / 10 : undefined,
            tags: gameData.genres?.map((g: any) => g.description).slice(0, 3) || ['게임']
          })
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`Failed to fetch details for app ${app.appid}:`, error)
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