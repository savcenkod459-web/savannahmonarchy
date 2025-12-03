import { Instagram, Send, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

const ShareButtons = () => {
  const { toast } = useToast();
  const currentUrl = window.location.href;

  const shareToTwitter = () => {
    const text = "Посмотрите эту роскошную кошку на SavannahMonarchy!";
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`, "_blank");
  };

  const shareToTelegram = () => {
    const text = "Посмотрите эту роскошную кошку на SavannahMonarchy!";
    window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(text)}`, "_blank");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    toast({
      title: "Ссылка скопирована",
      description: "Ссылка на страницу скопирована в буфер обмена",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground mr-2">Поделиться:</span>
      <Button variant="outline" size="icon" onClick={shareToTwitter} title="Поделиться в Twitter">
        <Share2 className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={shareToTelegram} title="Поделиться в Telegram">
        <Send className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={copyLink} title="Копировать ссылку">
        <Instagram className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ShareButtons;
