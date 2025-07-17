-- Create games table
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  steam_app_id INTEGER,
  player_count TEXT NOT NULL,
  is_cooperative BOOLEAN NOT NULL DEFAULT false,
  rating DECIMAL(3,1),
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "모든 사용자가 게임을 조회할 수 있음" 
ON public.games 
FOR SELECT 
USING (true);

CREATE POLICY "인증된 사용자가 게임을 추가할 수 있음" 
ON public.games 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "게임 작성자가 수정할 수 있음" 
ON public.games 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "게임 작성자가 삭제할 수 있음" 
ON public.games 
FOR DELETE 
USING (auth.uid() = created_by);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_games_updated_at
BEFORE UPDATE ON public.games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert mock cooperative games
INSERT INTO public.games (name, description, image_url, steam_app_id, player_count, is_cooperative, rating, tags, created_by) VALUES
('It Takes Two', '두 명이 함께 플레이하는 협동 어드벤처 게임', '/placeholder.svg', 1426210, '2명', true, 4.8, ARRAY['협동', '어드벤처', '퍼즐'], (SELECT id FROM auth.users LIMIT 1)),
('Portal 2', '물리학 기반 퍼즐 게임의 협동 모드', '/placeholder.svg', 620, '2명', true, 4.9, ARRAY['퍼즐', '1인칭', '협동'], (SELECT id FROM auth.users LIMIT 1)),
('Overcooked! 2', '요리 시뮬레이션 협동 게임', '/placeholder.svg', 728880, '1-4명', true, 4.6, ARRAY['요리', '파티', '협동'], (SELECT id FROM auth.users LIMIT 1)),
('A Way Out', '탈옥을 다룬 협동 액션 어드벤처', '/placeholder.svg', 1222700, '2명', true, 4.5, ARRAY['액션', '협동', '스토리'], (SELECT id FROM auth.users LIMIT 1)),
('Deep Rock Galactic', '우주 광부들의 협동 FPS', '/placeholder.svg', 548430, '1-4명', true, 4.7, ARRAY['FPS', '협동', 'SF'], (SELECT id FROM auth.users LIMIT 1)),
('Stardew Valley', '농장 시뮬레이션 게임', '/placeholder.svg', 413150, '1-4명', true, 4.8, ARRAY['농장', '시뮬레이션', '협동'], (SELECT id FROM auth.users LIMIT 1)),
('Astroneer', '우주 탐험 협동 샌드박스', '/placeholder.svg', 361420, '1-4명', true, 4.3, ARRAY['샌드박스', '협동', '우주'], (SELECT id FROM auth.users LIMIT 1)),
('Raft', '바다에서 뗏목 생존 협동 게임', '/placeholder.svg', 648800, '1-8명', true, 4.4, ARRAY['생존', '협동', '크래프팅'], (SELECT id FROM auth.users LIMIT 1)),
('Green Hell', '아마존 정글 생존 협동 게임', '/placeholder.svg', 493520, '1-4명', true, 4.1, ARRAY['생존', '협동', '정글'], (SELECT id FROM auth.users LIMIT 1)),
('7 Days to Die', '좀비 아포칼립스 생존 게임', '/placeholder.svg', 251570, '1-8명', true, 4.2, ARRAY['생존', '좀비', '협동'], (SELECT id FROM auth.users LIMIT 1));