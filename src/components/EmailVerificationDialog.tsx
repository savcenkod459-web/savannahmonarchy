import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EmailVerificationDialogProps {
  email: string;
  password: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
}

export const EmailVerificationDialog = ({
  email,
  password,
  open,
  onOpenChange,
  onVerified
}: EmailVerificationDialogProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Auto-send code when dialog opens
  useEffect(() => {
    if (open && !sentCode) {
      sendVerificationCode();
    }
  }, [open]);

  const sendVerificationCode = async () => {
    setLoading(true);
    try {
      // Generate 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      setSentCode(verificationCode);

      // Send code via edge function
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: { email, code: verificationCode }
      });

      if (error) throw error;

      // Set 60 second timer
      setTimer(60);

      toast({
        title: t("auth.verification.codeSent"),
        description: t("auth.verification.checkEmail")
      });
    } catch (error: any) {
      console.error("Error sending verification code:", error);
      const errorMessage = error.message?.includes('non-2xx') || error.message?.includes('Edge Function')
        ? t("errors.edgeFunctionError")
        : error.message;
      
      toast({
        title: t("auth.errors.error"),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const verifyCode = async () => {
    if (code === sentCode) {
      setLoading(true);
      try {
        // Создаём аккаунт после успешной верификации кода
        // Не используем emailRedirectTo чтобы Supabase не отправлял своё письмо
        const { error } = await supabase.auth.signUp({
          email,
          password
        });

        if (error) {
          if (error.message.includes("User already registered") || error.message.includes("user_already_exists")) {
            toast({
              title: t("auth.errors.userExists"),
              description: t("auth.errors.userExistsDescription"),
              variant: "destructive"
            });
          } else if (error.message.includes("weak_password") || error.message.includes("Password")) {
            toast({
              title: t("auth.errors.weakPassword"),
              description: t("auth.errors.weakPasswordDescription"),
              variant: "destructive"
            });
          } else {
            toast({
              title: t("auth.errors.signUpError"),
              description: error.message,
              variant: "destructive"
            });
          }
          return;
        }

        toast({
          title: t("auth.verification.successTitle"),
          description: t("auth.verification.accountCreated")
        });
        onVerified();
        onOpenChange(false);
        // Reset state
        setCode("");
        setSentCode(null);
      } catch (error: any) {
        toast({
          title: t("auth.errors.error"),
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    } else {
      toast({
        title: t("auth.errors.error"),
        description: t("auth.verification.invalidCode"),
        variant: "destructive"
      });
    }
  };

  const handleResend = () => {
    setCode("");
    sendVerificationCode();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card border-2 border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary-foreground" />
            </div>
            {t("auth.verification.title")}
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            {t("auth.verification.subtitle")} <span className="font-semibold text-primary">{email}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {loading && !sentCode ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-foreground/70">{t("auth.verification.sending")}</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground/80">
                  {t("auth.verification.codeLabel")}
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={(value) => setCode(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-14 text-xl border-primary/30" />
                      <InputOTPSlot index={1} className="w-12 h-14 text-xl border-primary/30" />
                      <InputOTPSlot index={2} className="w-12 h-14 text-xl border-primary/30" />
                      <InputOTPSlot index={3} className="w-12 h-14 text-xl border-primary/30" />
                      <InputOTPSlot index={4} className="w-12 h-14 text-xl border-primary/30" />
                      <InputOTPSlot index={5} className="w-12 h-14 text-xl border-primary/30" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button
                  onClick={verifyCode}
                  disabled={code.length !== 6 || loading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-glow transition-all duration-300"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  {t("auth.verification.verify")}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleResend}
                  disabled={loading || timer > 0}
                  className="w-full h-12 text-base font-medium border-2 border-primary/30 hover:border-primary"
                >
                  {timer > 0 
                    ? `${t("auth.verification.resendIn")} ${timer}${t("auth.verification.seconds")}`
                    : t("auth.verification.resend")
                  }
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
