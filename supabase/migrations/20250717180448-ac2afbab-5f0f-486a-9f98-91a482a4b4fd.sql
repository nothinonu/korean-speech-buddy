-- profiles 테이블에 DELETE 정책 추가
CREATE POLICY "사용자는 자신의 프로필만 삭제 가능" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);