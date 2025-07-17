-- 사용자 프로필 테이블 생성
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  steam_id TEXT,
  favorite_games TEXT[],
  play_style TEXT CHECK (play_style IN ('경쟁적', '캐주얼', '혼합')),
  is_premium BOOLEAN DEFAULT FALSE,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
CREATE POLICY "프로필은 모든 사용자가 조회 가능" 
  ON public.profiles FOR SELECT 
  USING (TRUE);

CREATE POLICY "사용자는 자신의 프로필만 수정 가능" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "사용자는 자신의 프로필만 삽입 가능" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 프로필 업데이트 트리거
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 새 사용자 가입시 자동 프로필 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY definer;

-- 새 사용자 가입시 프로필 자동 생성 트리거
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();