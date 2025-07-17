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

    // Get search term from request body
    const body = await req.json().catch(() => ({}))
    const searchTerm = body.search || ''
    
    if (!searchTerm.trim()) {
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

    // Get list of Steam apps
    const appsResponse = await fetch('https://api.steampowered.com/ISteamApps/GetAppList/v2/')
    const appsData = await appsResponse.json()
    
    // Filter apps by search term (case insensitive)
    const filteredApps = appsData.applist.apps
      .filter((app: SteamApp) => 
        app.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 20) // Limit to first 20 results to avoid rate limiting

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