import { Copy, Facebook, MessageCircle, Share2, Twitter, Check, Instagram } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useState, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

interface ShareButtonsProps {
  variant?: "inline" | "dropdown";
  className?: string;
}

// Custom icons for platforms not in lucide-react
const TikTokIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const DiscordIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
  </svg>
);

const SnapchatIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.669.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" />
  </svg>
);

const RedditIcon = () => (
  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

const ShareButtons = ({ variant = "dropdown", className = "" }: ShareButtonsProps) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const getShareUrl = () => {
    const baseUrl = "https://savannahmonarchy.com";
    const path = window.location.pathname;
    return path === "/" ? baseUrl : `${baseUrl}${path}`;
  };

  const shareUrl = getShareUrl();
  const shareTitle = t("seo.index.title");
  const shareDescription = t("seo.index.description");

  const handleAction = useCallback((action: () => void) => {
    action();
    setIsOpen(false);
  }, []);

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

  const shareToDiscord = () => {
    navigator.clipboard.writeText(`${shareTitle}\n${shareUrl}`);
    toast({
      title: t("share.linkCopied"),
      description: "Paste in Discord chat",
    });
  };

  const shareToInstagram = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: t("share.linkCopied"),
      description: "Paste in Instagram story or bio",
    });
  };

  const shareToTikTok = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: t("share.linkCopied"),
      description: "Paste in TikTok bio or comment",
    });
  };

  const shareToSnapchat = () => {
    window.open(
      `https://www.snapchat.com/share?link=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareToReddit = () => {
    window.open(
      `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
      "_blank",
      "width=600,height=400"
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
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        <span className="text-sm text-muted-foreground mr-2">{t("share.title")}:</span>
        <Button variant="outline" size="icon" onClick={shareToTwitter} title="Twitter/X" className="hover:scale-110 transition-transform">
          <Twitter className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={shareToFacebook} title="Facebook" className="hover:scale-110 transition-transform">
          <Facebook className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={shareToTelegram} title="Telegram" className="hover:scale-110 transition-transform">
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={shareToInstagram} title="Instagram" className="hover:scale-110 transition-transform">
          <Instagram className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={copyLink} title={t("share.copyLink")} className="hover:scale-110 transition-transform">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className={`rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary hover:scale-110 transition-all duration-300 ${className}`}
          title={t("share.title")}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 z-[9999] bg-background border border-primary/20 animate-scale-in"
        sideOffset={5}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => {
          // Only close if clicking outside the menu
          const target = e.target as HTMLElement;
          if (target.closest('[data-radix-dropdown-menu-content]')) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        {typeof navigator.share === "function" && (
          <>
            <DropdownMenuItem 
              onSelect={(e) => {
                e.preventDefault();
                nativeShare();
                setIsOpen(false);
              }} 
              className="cursor-pointer hover:bg-primary/10 transition-colors"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {t("share.native")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Main social networks */}
        <DropdownMenuItem onSelect={() => handleAction(shareToTwitter)} className="cursor-pointer hover:bg-primary/10 transition-colors">
          <Twitter className="h-4 w-4 mr-2" />
          Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleAction(shareToFacebook)} className="cursor-pointer hover:bg-primary/10 transition-colors">
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleAction(shareToInstagram)} className="cursor-pointer hover:bg-primary/10 transition-colors">
          <Instagram className="h-4 w-4 mr-2" />
          Instagram
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Messengers */}
        <DropdownMenuItem onSelect={() => handleAction(shareToTelegram)} className="cursor-pointer hover:bg-primary/10 transition-colors">
          <MessageCircle className="h-4 w-4 mr-2" />
          Telegram
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleAction(shareToWhatsApp)} className="cursor-pointer hover:bg-primary/10 transition-colors">
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleAction(shareToDiscord)} className="cursor-pointer hover:bg-primary/10 transition-colors">
          <DiscordIcon />
          <span className="ml-2">Discord</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleAction(shareToSnapchat)} className="cursor-pointer hover:bg-primary/10 transition-colors">
          <SnapchatIcon />
          <span className="ml-2">Snapchat</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Other platforms */}
        <DropdownMenuItem onSelect={() => handleAction(shareToTikTok)} className="cursor-pointer hover:bg-primary/10 transition-colors">
          <TikTokIcon />
          <span className="ml-2">TikTok</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleAction(shareToReddit)} className="cursor-pointer hover:bg-primary/10 transition-colors">
          <RedditIcon />
          <span className="ml-2">Reddit</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onSelect={() => handleAction(copyLink)} className="cursor-pointer hover:bg-primary/10 transition-colors">
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
