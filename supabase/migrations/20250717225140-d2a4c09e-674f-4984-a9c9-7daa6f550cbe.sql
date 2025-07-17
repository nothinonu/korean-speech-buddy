-- Create game_matches table for storing match requests
CREATE TABLE public.game_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'cancelled')),
  preferred_players INTEGER DEFAULT 2,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_matches ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all match requests" 
ON public.game_matches 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own match requests" 
ON public.game_matches 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own match requests" 
ON public.game_matches 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own match requests" 
ON public.game_matches 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_game_matches_updated_at
BEFORE UPDATE ON public.game_matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();