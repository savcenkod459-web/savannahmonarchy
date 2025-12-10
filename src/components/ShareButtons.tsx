import { Copy, Facebook, MessageCircle, Share2, Twitter, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface ShareButtonsProps {
  variant?: "inline" | "dropdown";
  className?: string;
}

const ShareButtons = ({ variant = "dropdown", className = "" }: ShareButtonsProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  
  // Use canonical URL for consistent sharing
  const getShareUrl = () => {
    const baseUrl = "https://savannahmonarchy.com";
    const path = window.location.pathname;
    return path === "/" ? baseUrl : `${baseUrl}${path}`;
  };

  const shareUrl = getShareUrl();
  const shareTitle = t("seo.index.title");
  const shareDescription = t("seo.index.description");

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareToTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareToWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareTitle}\n${shareUrl}`)}`,
      "_blank"
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: t("share.linkCopied"),
        description: t("share.linkCopiedDesc"),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: t("share.error"),
        description: t("share.errorDesc"),
        variant: "destructive",
      });
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled sharing
      }
    }
  };

  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-muted-foreground mr-2">{t("share.title")}:</span>
        <Button variant="outline" size="icon" onClick={shareToTwitter} title="Twitter/X">
          <Twitter className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={shareToFacebook} title="Facebook">
          <Facebook className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={shareToTelegram} title="Telegram">
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={copyLink} title={t("share.copyLink")}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={`rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary ${className}`}
          title={t("share.title")}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {typeof navigator.share === "function" && (
          <DropdownMenuItem onClick={nativeShare} className="cursor-pointer">
            <Share2 className="h-4 w-4 mr-2" />
            {t("share.native")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={shareToTwitter} className="cursor-pointer">
          <Twitter className="h-4 w-4 mr-2" />
          Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook} className="cursor-pointer">
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTelegram} className="cursor-pointer">
          <MessageCircle className="h-4 w-4 mr-2" />
          Telegram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToWhatsApp} className="cursor-pointer">
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink} className="cursor-pointer">
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {t("share.copyLink")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButtons;
