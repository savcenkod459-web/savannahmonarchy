import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { EmailVerificationDialog } from "@/components/EmailVerificationDialog";
import { useTranslation } from "react-i18next";
import { useFormValidation } from "@/hooks/useFormValidation";

const Auth = () => {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPassword, setPendingPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false); // Флаг для блокировки редиректа
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Подключаем кастомную валидацию с переводами
  useFormValidation();
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Не редиректим если идёт верификация
      if (event === 'SIGNED_IN' && !isVerifying) {
        navigate("/");
      }
    });
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Не редиректим если идёт верификация
      if (session && !isVerifying) {
        navigate("/");
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, isVerifying]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация полей перед отправкой
    const form = e.target as HTMLFormElement;
    const emailInput = form.querySelector('#email') as HTMLInputElement;
    const passwordInput = form.querySelector('#password') as HTMLInputElement;
    
    if (!emailInput.validity.valid || !passwordInput.validity.valid) {
      if (!emailInput.validity.valid) {
        emailInput.reportValidity();
      } else {
        passwordInput.reportValidity();
      }
      return;
    }
    
    // Дополнительная проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: t("auth.errors.invalidEmail"),
        description: t("auth.validation.emailInvalid")
      });
      return;
    }
    
    setLoading(true);
    
    try {
      if (authMode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              variant: "destructive",
              title: t("auth.errors.invalidCredentials"),
              description: t("auth.errors.invalidCredentialsDescription")
            });
          } else {
            toast({
              variant: "destructive",
              title: t("auth.errors.signInError"),
              description: error.message
            });
          }
          return;
        }
        
        toast({
          title: t("auth.success.signInTitle"),
          description: t("auth.success.signInDescription")
        });
      } else if (authMode === "signup") {
        // Сначала проверяем существует ли пользователь через попытку регистрации
        // С auto_confirm_email: false аккаунт создастся но не подтвердится
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        
        // Если пользователь уже существует (identities пустой массив)
        if (signUpData?.user?.identities?.length === 0) {
          toast({
            variant: "destructive",
            title: t("auth.errors.userExists"),
            description: t("auth.errors.userExistsDescription")
          });
          return;
        }
        
        // Если ошибка регистрации - пользователь уже зарегистрирован
        if (signUpError) {
          if (signUpError.message.includes("already registered") || 
              signUpError.message.includes("User already registered")) {
            toast({
              variant: "destructive",
              title: t("auth.errors.userExists"),
              description: t("auth.errors.userExistsDescription")
            });
            return;
          }
          toast({
            variant: "destructive",
            title: t("auth.errors.signUpError"),
            description: signUpError.message
          });
          return;
        }
        
        // Пользователь создан успешно - показываем окно верификации email
        // С auto_confirm: false пользователь НЕ залогинен автоматически
        setIsVerifying(true);
        setPendingEmail(email);
        setPendingPassword(password);
        setShowVerification(true);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("auth.errors.error"),
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <Navigation />
      
      <main className="flex-1 flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-xl glass-card border-2 border-primary/30 shadow-glow animate-scale-in backdrop-blur-xl">
          <CardHeader className="space-y-3 pb-6 pt-10 px-8">
            <div className="flex justify-center mb-4 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            
            <CardTitle className="text-3xl font-display font-black text-center text-luxury-gradient luxury-text-shadow">
              {authMode === "signup" ? t("auth.signup.title") : t("auth.signin.title")}
            </CardTitle>
            <CardDescription className="text-center text-foreground/70 text-base font-medium">
              {authMode === "signup" ? t("auth.signup.subtitle") : t("auth.signin.subtitle")}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleEmailAuth} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground/80">
                  {t("auth.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 px-4 glass-card border-2 border-primary/20 focus:border-primary/50 transition-all duration-300"
                  placeholder="your@email.com"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground/80">
                  {t("auth.password")}
                </Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-12 px-4 glass-card border-2 border-primary/20 focus:border-primary/50 transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>

              {authMode === "signin" && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-primary hover:text-primary/80 p-0 h-auto hover-lift"
                    onClick={() => navigate("/reset-password")}
                  >
                    {t("auth.forgotPassword")}
                  </Button>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-glow transition-all duration-300 hover-lift"
                disabled={loading}
              >
                {loading ? t("auth.loading") : authMode === "signin" ? t("auth.signinButton") : t("auth.signupButton")}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full h-12 text-base font-semibold glass-card border-2 border-primary/30 hover:border-primary text-primary hover:bg-primary/10 hover:text-primary transition-all duration-300"
                onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
              >
                {authMode === "signin" ? t("auth.noAccount") : t("auth.hasAccount")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      
      <EmailVerificationDialog
        email={pendingEmail}
        password={pendingPassword}
        open={showVerification}
        onOpenChange={(open) => {
          setShowVerification(open);
          if (!open) {
            setIsVerifying(false);
          }
        }}
        onVerified={async () => {
          try {
            // Подтверждаем email через edge function (использует admin API)
            const { error: confirmError } = await supabase.functions.invoke('confirm-user-email', {
              body: { email: pendingEmail }
            });
            
            if (confirmError) {
              console.error("Confirm error:", confirmError);
              toast({
                variant: "destructive",
                title: t("auth.errors.error"),
                description: confirmError.message
              });
              setIsVerifying(false);
              return;
            }
            
            // Теперь логиним пользователя
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: pendingEmail,
              password: pendingPassword
            });
            
            if (signInError) {
              toast({
                variant: "destructive",
                title: t("auth.errors.signInError"),
                description: signInError.message
              });
              setIsVerifying(false);
              return;
            }
            
            toast({
              title: t("auth.verification.successTitle"),
              description: t("auth.verification.successDescription")
            });
            
            setEmail("");
            setPassword("");
            setPendingEmail("");
            setPendingPassword("");
            setIsVerifying(false);
            navigate("/");
          } catch (error: any) {
            console.error("Verification flow error:", error);
            toast({
              variant: "destructive",
              title: t("auth.errors.error"),
              description: error.message
            });
            setIsVerifying(false);
          }
        }}
      />
      
      <Footer />
    </div>
  );
};

export default Auth;
