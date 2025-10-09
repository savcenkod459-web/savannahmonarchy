import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
const Auth = () => {
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "reset" | "phone" | "update-password">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Helper function to get redirect URL with https://
  const getRedirectUrl = (path: string = "/") => {
    const origin = window.location.origin;
    // Force https:// for non-localhost environments
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return `${origin}${path}`;
    }
    return origin.replace(/^http:/, "https:") + path;
  };
  
  useEffect(() => {
    console.log('=== Auth page mounted ===');
    console.log('Current URL:', window.location.href);
    console.log('Hash:', window.location.hash);
    console.log('Search:', window.location.search);
    
    let isRecoveryMode = false;
    
    // Check both hash and query parameters for password recovery
    // Check hash parameters (format: #access_token=xxx&type=recovery)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashType = hashParams.get('type');
    const hashToken = hashParams.get('access_token');
    
    // Check query parameters (format: ?type=recovery&access_token=xxx)
    const searchParams = new URLSearchParams(window.location.search);
    const queryType = searchParams.get('type');
    const queryToken = searchParams.get('access_token');
    
    const type = hashType || queryType;
    const token = hashToken || queryToken;
    
    console.log('Recovery params:', { type, hasToken: !!token });
    
    // If this is a password recovery link, force password update mode
    if (type === 'recovery' || token) {
      console.log('✅ RECOVERY MODE ACTIVATED');
      setAuthMode('update-password');
      isRecoveryMode = true;
    }
    
    // Set up auth state listener
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Auth event:', event, 'Has session:', !!session);
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('✅ PASSWORD_RECOVERY event - switching to update mode');
        setAuthMode('update-password');
      } else if (event === 'SIGNED_IN' && authMode !== 'update-password') {
        console.log('➡️ User signed in, redirecting to home');
        navigate("/");
      }
    });
    
    // Check session only if NOT in recovery mode
    if (!isRecoveryMode) {
      supabase.auth.getSession().then(({
        data: {
          session
        }
      }) => {
        if (session) {
          console.log('Session exists, redirecting to home');
          navigate("/");
        }
      });
    }
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          // Provide user-friendly error messages
          if (error.message.includes("Invalid login credentials")) {
            toast({
              variant: "destructive",
              title: "Неверные данные для входа",
              description: "Email или пароль неверны. Если вы забыли пароль, нажмите 'Забыли пароль?'"
            });
          } else {
            toast({
              variant: "destructive",
              title: "Ошибка входа",
              description: error.message
            });
          }
          return;
        }
        toast({
          title: "Успешный вход",
          description: "Вы успешно вошли в систему"
        });
      } else if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: getRedirectUrl("/")
          }
        });
        if (error) {
          // Provide user-friendly error messages for signup
          if (error.message.includes("User already registered") || error.message.includes("user_already_exists")) {
            toast({
              variant: "destructive",
              title: "Пользователь уже существует",
              description: "Этот email уже зарегистрирован. Попробуйте войти вместо регистрации."
            });
            setAuthMode("signin");
          } else if (error.message.includes("weak_password") || error.message.includes("Password")) {
            toast({
              variant: "destructive",
              title: "Слабый пароль",
              description: "Пароль должен содержать минимум 8 символов, включая буквы, цифры и специальные символы. Попробуйте другой пароль."
            });
          } else {
            toast({
              variant: "destructive",
              title: "Ошибка регистрации",
              description: error.message
            });
          }
          return;
        }
        toast({
          title: "Регистрация успешна!",
          description: "Теперь вы можете войти в систему"
        });
        setAuthMode("signin");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Build the full redirect URL explicitly
      const origin = window.location.origin;
      const redirectUrl = origin.includes("localhost") 
        ? `${origin}/auth` 
        : origin.replace(/^http:/, "https:") + "/auth";
      
      console.log('Sending password reset email with redirectTo:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      
      if (error) throw error;
      
      toast({
        title: "Письмо отправлено",
        description: "Проверьте почту и перейдите по ссылке для сброса пароля"
      });
      setAuthMode("signin");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!showOtpInput) {
        const { error } = await supabase.auth.signInWithOtp({
          phone: phone
        });
        if (error) throw error;
        setShowOtpInput(true);
        toast({
          title: "Код отправлен",
          description: "Проверьте SMS с кодом подтверждения"
        });
      } else {
        const { error } = await supabase.auth.verifyOtp({
          phone: phone,
          token: otp,
          type: 'sms'
        });
        if (error) throw error;
        toast({
          title: "Успешный вход",
          description: "Вы успешно вошли в систему"
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl("/")
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message
      });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Пароли не совпадают"
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Пароль должен быть не менее 8 символов"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to update password...');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('Password update error:', error);
        
        // Provide specific error messages
        if (error.message.includes('invalid token') || error.message.includes('signature')) {
          toast({
            variant: "destructive",
            title: "Ссылка устарела",
            description: "Ссылка для восстановления пароля истекла. Пожалуйста, запросите новую ссылку."
          });
          setAuthMode("reset");
        } else {
          throw error;
        }
        return;
      }
      
      console.log('Password updated successfully');
      
      toast({
        title: "Пароль обновлен",
        description: "Ваш пароль успешно изменен. Теперь вы можете войти с новым паролем."
      });
      
      // Clear the hash from URL
      window.location.hash = '';
      
      setAuthMode("signin");
      setNewPassword("");
      setConfirmPassword("");
      
      // Wait a bit before redirecting
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Произошла ошибка при обновлении пароля"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '1s'
      }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <Navigation />
      
      <main className="flex-1 flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8 relative">
        <Card className="w-full max-w-xl border-2 border-primary shadow-lg animate-scale-in backdrop-blur-xl bg-background relative overflow-hidden">
          <CardHeader className="space-y-3 pb-6 pt-10 px-8 relative">
            <div className="flex justify-center mb-4 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <CardTitle className="text-3xl font-display font-black text-center text-luxury-gradient luxury-text-shadow animate-fade-in">
              {authMode === "reset" ? "Сброс пароля" : 
               authMode === "update-password" ? "Новый пароль" :
               authMode === "signup" ? "Создать аккаунт" : "Добро пожаловать"}
            </CardTitle>
            <CardDescription className="text-center animate-fade-in text-foreground/70 text-base font-medium">
              {authMode === "reset" ? "Введите email для сброса пароля" : 
               authMode === "update-password" ? "Введите новый пароль" :
               authMode === "signup" ? "Зарегистрируйтесь для доступа" : "Войдите в свой аккаунт"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-10 relative">
            {authMode === "update-password" ? (
              <div className="space-y-6">
                <div className="text-center space-y-2 mb-8">
                  <p className="text-foreground/80">
                    Введите новый пароль для вашего аккаунта
                  </p>
                  <p className="text-sm text-foreground/60">
                    Минимум 8 символов
                  </p>
                </div>
                
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="new-password" className="text-sm font-semibold text-foreground/80">
                      Новый пароль
                    </Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      required 
                      minLength={8}
                      className="h-12 px-4 border-2 border-primary/20 focus:border-primary/50 transition-all duration-300" 
                      placeholder="Введите новый пароль" 
                      autoFocus
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="confirm-password" className="text-sm font-semibold text-foreground/80">
                      Подтвердите пароль
                    </Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      required 
                      minLength={8}
                      className="h-12 px-4 border-2 border-primary/20 focus:border-primary/50 transition-all duration-300" 
                      placeholder="Повторите новый пароль" 
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:shadow-glow transition-all duration-300" 
                    disabled={loading}
                  >
                    {loading ? "Обновление..." : "Изменить пароль"}
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => {
                      window.location.hash = '';
                      setAuthMode("reset");
                    }}
                  >
                    Запросить новую ссылку
                  </Button>
                </form>
              </div>
            ) : (
              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="phone">Телефон</TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-4">
                  {authMode === "reset" ? (
                  <form onSubmit={handlePasswordReset} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="reset-email" className="text-sm font-semibold text-foreground/80">
                        Email
                      </Label>
                      <Input 
                        id="reset-email" 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                        className="h-12 px-4 border-2 border-primary/20 focus:border-primary/50 transition-all duration-300" 
                        placeholder="your@email.com" 
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:shadow-glow transition-all duration-300" 
                      disabled={loading}
                    >
                      {loading ? "Отправка..." : "Отправить инструкции"}
                    </Button>

                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full" 
                      onClick={() => setAuthMode("signin")}
                    >
                      Вернуться к входу
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleEmailAuth} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-sm font-semibold text-foreground/80">
                        Email
                      </Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                        className="h-12 px-4 border-2 border-primary/20 focus:border-primary/50 transition-all duration-300" 
                        placeholder="your@email.com" 
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="password" className="text-sm font-semibold text-foreground/80">
                        Пароль
                      </Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                        minLength={8}
                        className="h-12 px-4 border-2 border-primary/20 focus:border-primary/50 transition-all duration-300" 
                        placeholder="••••••••" 
                      />
                    </div>

                    {authMode === "signin" && (
                      <div className="flex justify-end">
                        <Button 
                          type="button" 
                          variant="link" 
                          className="text-sm text-primary hover:text-primary/80 p-0 h-auto"
                          onClick={() => setAuthMode("reset")}
                        >
                          Забыли пароль?
                        </Button>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:shadow-glow transition-all duration-300" 
                      disabled={loading}
                    >
                      {loading ? "Загрузка..." : authMode === "signin" ? "Войти" : "Зарегистрироваться"}
                    </Button>

                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-primary/20" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">или</span>
                      </div>
                    </div>

                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full h-12 text-base border-2 border-primary/20 hover:border-primary/40"
                      onClick={handleGoogleAuth}
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Войти через Google
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full h-12 text-base font-semibold border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                      onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
                    >
                      {authMode === "signin" ? "Нет аккаунта? Зарегистрируйтесь" : "Уже есть аккаунт? Войдите"}
                    </Button>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                <form onSubmit={handlePhoneAuth} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-sm font-semibold text-foreground/80">
                      Номер телефона
                    </Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      required 
                      className="h-12 px-4 border-2 border-primary/20 focus:border-primary/50 transition-all duration-300" 
                      placeholder="+7 (___) ___-__-__"
                      disabled={showOtpInput}
                    />
                  </div>

                  {showOtpInput && (
                    <div className="space-y-3">
                      <Label htmlFor="otp" className="text-sm font-semibold text-foreground/80">
                        Код подтверждения
                      </Label>
                      <Input 
                        id="otp" 
                        type="text" 
                        value={otp} 
                        onChange={e => setOtp(e.target.value)} 
                        required 
                        maxLength={6}
                        className="h-12 px-4 border-2 border-primary/20 focus:border-primary/50 transition-all duration-300" 
                        placeholder="000000"
                      />
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:shadow-glow transition-all duration-300" 
                    disabled={loading}
                  >
                    {loading ? "Загрузка..." : showOtpInput ? "Подтвердить код" : "Отправить SMS код"}
                  </Button>

                  {showOtpInput && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full" 
                      onClick={() => {
                        setShowOtpInput(false);
                        setOtp("");
                      }}
                    >
                      Изменить номер
                    </Button>
                  )}
                </form>
              </TabsContent>
            </Tabs>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>;
};
export default Auth;