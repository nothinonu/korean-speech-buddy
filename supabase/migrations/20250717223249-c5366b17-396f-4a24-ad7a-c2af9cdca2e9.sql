-- 사용자 가입 시 프로필 자동 생성을 위한 트리거 추가
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();