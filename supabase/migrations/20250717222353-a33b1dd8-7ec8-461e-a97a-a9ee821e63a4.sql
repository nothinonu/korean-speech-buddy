-- Fix RLS policy for games table to allow system games (created_by IS NULL)
DROP POLICY IF EXISTS "인증된 사용자가 게임을 추가할 수 있음" ON public.games;

CREATE POLICY "인증된 사용자가 게임을 추가할 수 있음" 
ON public.games 
FOR INSERT 
WITH CHECK (auth.uid() = created_by OR created_by IS NULL);