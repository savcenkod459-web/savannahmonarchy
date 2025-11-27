import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EmailVerificationDialogProps {
  email: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
}

export const EmailVerificationDialog = ({
  email,
  open,
  onOpenChange,
  onVerified
}: EmailVerificationDialogProps) => {
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sentCode, setSentCode] = React.useState<string | null>(null);
  const [timer, setTimer] = React.useState(0);
  const { toast } = useToast();
  const { t } = useTranslation();

  const sendVerificationCode = async () => {
    setLoading(true);
    try {
      // Генерируем 6-значный код
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      setSentCode(verificationCode);

      // Отправляем код через edge function
      const { data, error } = await supabase.functions.invoke('send-verification-code', {
        body: { email, code: verificationCode }
      });

      if (error) throw error;

      // Устанавливаем таймер на 60 секунд
      setTimer(60);

      // Для разработки показываем код в toast
      if (data?.debug_code) {
        toast({
          title: "Код отправлен (DEV MODE)",
          description: `Код подтверждения: ${data.debug_code}`,
          duration: 10000
        });
      } else {
        toast({
          title: "Код отправлен",
          description: "Проверьте вашу почту"
        });
      }
    } catch (error: any) {
      const errorMessage = error.message?.includes('non-2xx') || error.message?.includes('Edge Function')
        ? t("errors.edgeFunctionError")
        : error.message;
      
      toast({
        title: t("auth.error"),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const verifyCode = () => {
    if (code === sentCode) {
      toast({
        title: "Успешно",
        description: "Email подтвержден"
      });
      onVerified();
      onOpenChange(false);
    } else {
      toast({
        title: "Ошибка",
        description: "Неверный код подтверждения",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Подтверждение email
          </DialogTitle>
          <DialogDescription>
            Введите код подтверждения, отправленный на {email}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!sentCode ? (
            <Button
              onClick={sendVerificationCode}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Отправка..." : "Отправить код на почту"}
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="verification-code">Код подтверждения</Label>
                <Input
                  id="verification-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Введите 6-значный код"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={sendVerificationCode}
                  disabled={loading || timer > 0}
                  className="flex-1"
                >
                  {timer > 0 ? `Отправить снова (${timer}с)` : "Отправить снова"}
                </Button>
                <Button
                  onClick={verifyCode}
                  disabled={code.length !== 6}
                  className="flex-1"
                >
                  Подтвердить
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
