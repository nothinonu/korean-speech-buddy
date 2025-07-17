import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<boolean>
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // 인증 상태 변화 감지를 먼저 설정
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session)
        setUser(session?.user ?? null)
        
        // 프로필 동기화 (새 세션이 있을 때만)
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            syncUserProfile(session.user);
          }, 100);
        }
        
        setLoading(false)
      }
    )

    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const syncUserProfile = async (user: any) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('프로필 조회 오류:', error);
        return;
      }

      // 프로필이 없으면 생성
      if (!profile) {
        const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user';
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: username,
            display_name: username
          });

        if (insertError) {
          console.error('프로필 생성 오류:', insertError);
        } else {
          console.log('프로필이 성공적으로 생성되었습니다');
        }
      }
    } catch (error) {
      console.error('프로필 동기화 중 오류:', error);
    }
  }

  const signUp = async (email: string, password: string, username: string): Promise<boolean> => {
    try {
      const redirectUrl = `${window.location.origin}/`
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username
          }
        }
      })

      if (error) {
        toast({
          title: "회원가입 실패",
          description: error.message,
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "회원가입 성공",
        description: "이메일을 확인해주세요.",
      })
      return true
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        description: "다시 시도해주세요.",
        variant: "destructive",
      })
      return false
    }
  }

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "로그인 실패",
          description: "이메일 또는 비밀번호를 확인해주세요.",
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "로그인 성공",
        description: "게이머 커뮤니티에 오신 것을 환영합니다!",
      })
      return true
    } catch (error) {
      toast({
        title: "오류가 발생했습니다",
        description: "다시 시도해주세요.",
        variant: "destructive",
      })
      return false
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      toast({
        title: "로그아웃",
        description: "안전하게 로그아웃되었습니다.",
      })
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}