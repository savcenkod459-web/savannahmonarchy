import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOHeadProps {
  titleKey?: string;
  descriptionKey?: string;
  keywordsKey?: string;
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: object;
  page?: string;
}

// Supported languages for hreflang
const SUPPORTED_LANGUAGES = ['en', 'ru', 'uk', 'de', 'fr', 'es', 'pt', 'ar', 'zh'];

// Language to locale mapping for og:locale
const LOCALE_MAP: Record<string, string> = {
  en: 'en_US',
  ru: 'ru_RU',
  uk: 'uk_UA',
  de: 'de_DE',
  fr: 'fr_FR',
  es: 'es_ES',
  pt: 'pt_PT',
  ar: 'ar_SA',
  zh: 'zh_CN'
};

const SEOHead = ({
  titleKey,
  descriptionKey,
  keywordsKey,
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = 'https://savannahmonarchy.com/og-image.png',
  ogType = 'website',
  structuredData,
  page = ''
}: SEOHeadProps) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  
  // Use translation keys if provided, otherwise fallback to direct values
  const finalTitle = titleKey ? t(titleKey) : title || '';
  const finalDescription = descriptionKey ? t(descriptionKey) : description || '';
  const finalKeywords = keywordsKey ? t(keywordsKey) : keywords || '';
  
  const fullTitle = `${finalTitle} | SavannahMonarchy`;
  const baseUrl = 'https://savannahmonarchy.com';
  const pagePath = page ? `/${page}` : '';
  const canonical = canonicalUrl || `${baseUrl}${pagePath}`;
  const currentLocale = LOCALE_MAP[currentLang] || 'en_US';

  return (
    <Helmet>
      {/* Language */}
      <html lang={currentLang} />
      
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="language" content={currentLang} />
      <link rel="canonical" href={canonical} />

      {/* Hreflang tags for all supported languages */}
      {SUPPORTED_LANGUAGES.map(lang => (
        <link 
          key={lang}
          rel="alternate" 
          hrefLang={lang} 
          href={`${baseUrl}${pagePath}?lang=${lang}`} 
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="SavannahMonarchy" />
      <meta property="og:locale" content={currentLocale} />
      
      {/* Alternate locales for Open Graph */}
      {SUPPORTED_LANGUAGES.filter(lang => lang !== currentLang).map(lang => (
        <meta key={lang} property="og:locale:alternate" content={LOCALE_MAP[lang]} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
