-- 프로필 테이블에 Steam 관련 필드 추가
ALTER TABLE public.profiles 
ADD COLUMN steam_id TEXT,
ADD COLUMN steam_profile_url TEXT,
ADD COLUMN steam_avatar_url TEXT,
ADD COLUMN steam_display_name TEXT,
ADD COLUMN steam_game_count INTEGER DEFAULT 0,
ADD COLUMN steam_level INTEGER DEFAULT 0,
ADD COLUMN steam_last_sync TIMESTAMP WITH TIME ZONE;