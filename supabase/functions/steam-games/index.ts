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
      // Steam에서 "coop" 태그가 있는 인기 게임들을 더 많이 가져오기
      const coopGameAppIds = [
        // 기존 협동 게임들
        1091500, // Cyberpunk 2077
        620, // Portal 2
        366900, // Overcooked! 2
        1172470, // Apex Legends
        413150, // Stardew Valley
        632360, // Risk of Rain 2
        322330, // Don't Starve Together
        513710, // Payday 2
        550, // Left 4 Dead 2
        1938090, // Call of Duty: Warzone 2.0
        381210, // Dead by Daylight
        275850, // No Man's Sky
        863550, // The Forest
        289070, // Sid Meier's Civilization VI
        
        // 추가 협동 게임들
        1151340, // It Takes Two
        570940, // DARK SOULS III
        105600, // Terraria
        230410, // Warframe
        252490, // Rust
        553850, // HELLDIVERS 2
        1406990, // Valheim
        346110, // ARK: Survival Evolved
        582010, // Monster Hunter: World
        892970, // Elden Ring
        552520, // Human: Fall Flat
        774361, // Astroneer
        736260, // Raft
        815370, // Green Hell
        251570, // 7 Days to Die
        814380, // Sekiro: Shadows Die Twice
        49520, // Borderlands 2
        367520, // Hollow Knight
        304930, // Unturned
        238460, // BattleBlock Theater
        1581630, // Golf With Your Friends
        646570, // Slay the Spire
        293780, // War Thunder
        1240440, // Halo Infinite
        236850, // Europa Universalis IV
        556450, // Hearthstone
        578080, // PLAYERUNKNOWN'S BATTLEGROUNDS
        431960, // Wallpaper Engine
        646570, // Slay the Spire
        294100, // RimWorld
        251570, // 7 Days to Die
        518790, // Overwatch 2
        440900, // Conan Exiles
        489830, // The Elder Scrolls Online
        323190, // Forts
        214850, // Magicka 2
        214850, // Magicka
        214850, // Magicka 2
        570, // Dota 2
        730, // Counter-Strike 2
        440, // Team Fortress 2
        271590, // Grand Theft Auto V
        231430, // Company of Heroes 2
        1203220, // NARAKA: BLADEPOINT
        359550, // Tom Clancy's Rainbow Six Siege
        438100, // VRChat
        1091500, // Cyberpunk 2077
        1985790, // Lethal Company
        1966720, // Phasmophobia
        1326470, // Sons Of The Forest
        739630, // Pico Park
        1174180, // Red Dead Redemption 2
        396750, // Overwatch
        72850, // The Elder Scrolls V: Skyrim
        292030, // The Witcher 3: Wild Hunt
        
        // 새로운 협동 게임들 더 추가
        311210, // Call of Duty: Black Ops III
        393380, // Squad
        251570, // 7 Days to Die
        251570, // 7 Days to Die (중복 제거용)
        394360, // Hearts of Iron IV
        1296830, // Golf It!
        524220, // NieR: Automata
        394360, // Hearts of Iron IV
        291550, // Brawlhalla
        368870, // Age of Empires II: Definitive Edition
        550, // Left 4 Dead 2
        239140, // Dying Light
        1382330, // READY OR NOT
        1623730, // Palworld
        1086940, // Baldur's Gate 3
        377160, // Fallout 4
        
        // 인디 협동 게임들
        447020, // Cuphead
        1649240, // A Way Out
        394360, // Hearts of Iron IV
        1593500, // God of War
        1091500, // Cyberpunk 2077
        489830, // The Elder Scrolls Online
        244210, // Assetto Corsa
        1174180, // Red Dead Redemption 2
        548430, // Deep Rock Galactic
        739630, // Pico Park
        620980, // Beat Saber
        322330, // Don't Starve Together
        394690, // Tower Unite
        1326470, // Sons Of The Forest
        896100, // Moving Out
        
        // 플랫포머 협동 게임들
        311210, // Call of Duty: Black Ops III
        238460, // BattleBlock Theater
        1649240, // A Way Out
        447020, // Cuphead
        632360, // Risk of Rain 2
        440900, // Conan Exiles
        863550, // The Forest
        548430, // Deep Rock Galactic
        582010, // Monster Hunter: World
        739630, // Pico Park
        1581630, // Golf With Your Friends
        552520, // Human: Fall Flat
        1151340, // It Takes Two
        896100, // Moving Out
        739630, // Pico Park
        448510, // Overcooked!
        366900, // Overcooked! 2
        1296830, // Golf It!
        
        // 서바이벌 협동 게임들
        346110, // ARK: Survival Evolved
        1406990, // Valheim
        863550, // The Forest
        252490, // Rust
        815370, // Green Hell
        251570, // 7 Days to Die
        440900, // Conan Exiles
        736260, // Raft
        774361, // Astroneer
        1326470, // Sons Of The Forest
        304930, // Unturned
        294100, // RimWorld
        489830, // The Elder Scrolls Online
        
        // 액션 협동 게임들
        553850, // HELLDIVERS 2
        550, // Left 4 Dead 2
        381210, // Dead by Daylight
        230410, // Warframe
        513710, // Payday 2
        1073600, // Dead by Daylight
        1966720, // Phasmophobia
        1985790, // Lethal Company
        239140, // Dying Light
        1382330, // READY OR NOT
        
        // 레이싱 협동 게임들
        244210, // Assetto Corsa
        
        // VR 협동 게임들
        620980, // Beat Saber
        438100, // VRChat
        
        // 파티 게임들
        394690, // Tower Unite
        1581630, // Golf With Your Friends
        1296830, // Golf It!
        739630, // Pico Park
        896100, // Moving Out
        448510, // Overcooked!
        366900, // Overcooked! 2
        
        // 추가로 더 많은 협동 게임들
        1623730, // Palworld
        1086940, // Baldur's Gate 3
        1174180, // Red Dead Redemption 2
        377160, // Fallout 4
        524220, // NieR: Automata
        291550, // Brawlhalla
        368870, // Age of Empires II: Definitive Edition
        1593500, // God of War
        292030, // The Witcher 3: Wild Hunt
        72850, // The Elder Scrolls V: Skyrim
        359550, // Tom Clancy's Rainbow Six Siege
        518790, // Overwatch 2
        396750, // Overwatch
        323190, // Forts
        214850, // Magicka 2
        
        // 최신 인기 협동 게임들 추가
        1245620, // ELDEN RING
        1174180, // Red Dead Redemption 2
        582010, // Monster Hunter: World
        814380, // Sekiro: Shadows Die Twice
        1593500, // God of War
        524220, // NieR: Automata
        377160, // Fallout 4
        292030, // The Witcher 3: Wild Hunt
        72850, // The Elder Scrolls V: Skyrim
        1086940, // Baldur's Gate 3
        1623730, // Palworld
        1966720, // Phasmophobia
        1985790, // Lethal Company
        1382330, // READY OR NOT
        1326470, // Sons Of The Forest
        
        // 클래식 협동 게임들
        620, // Portal 2
        550, // Left 4 Dead 2
        105600, // Terraria
        49520, // Borderlands 2
        440, // Team Fortress 2
        322330, // Don't Starve Together
        413150, // Stardew Valley
        
        // MMO 협동 게임들
        570, // Dota 2
        730, // Counter-Strike 2
        230410, // Warframe
        489830, // The Elder Scrolls Online
        
        // 전략 협동 게임들
        289070, // Sid Meier's Civilization VI
        236850, // Europa Universalis IV
        394360, // Hearts of Iron IV
        231430, // Company of Heroes 2
        368870, // Age of Empires II: Definitive Edition
        323190, // Forts
        393380, // Squad
        
        // 시뮬레이션 협동 게임들
        294100, // RimWorld
        774361, // Astroneer
        244210, // Assetto Corsa
        
        // 인디 협동 게임들 더 추가
        447020, // Cuphead
        552520, // Human: Fall Flat
        739630, // Pico Park
        1296830, // Golf It!
        896100, // Moving Out
        1581630, // Golf With Your Friends
        448510, // Overcooked!
        366900, // Overcooked! 2
        1151340, // It Takes Two
        1649240, // A Way Out
        632360, // Risk of Rain 2
        548430, // Deep Rock Galactic
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
      
      // Create app objects for these known cooperative games - use all app IDs
      filteredApps = coopGameAppIds.map(appid => ({ appid, name: '' }));
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