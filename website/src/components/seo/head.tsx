import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
}

export default function SEO({ 
  title = "DevTool+ | The All-in-One Developer I/O Toolbox", 
  description = "A privacy-first VS Code extension providing 35+ local developer tools directly in your code editor. No internet required.",
  canonicalUrl = "https://fuzionix.github.io/devtool-plus/"
}: SEOProps) {
  const siteUrl = "https://fuzionix.github.io/devtool-plus/";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DevTool+",
    "operatingSystem": "Visual Studio Code, Cursor, Windsurf",
    "applicationCategory": "DeveloperApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": description,
    "featureList": "All-in-One Developer Toolkit, Offline tools, Privacy-first, Fast performance, Easy installation, Free and Open Source",
    "softwareRequirements": "Visual Studio Code",
    "author": {
      "@type": "Organization",
      "name": "Fuzionix"
    }
  };

  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Keywords */}
      <meta name="keywords" content="VS Code Extension, Developer Tools, Offline Tools, JSON Formatter, JWT Decoder, Base64 Encoder, Color Picker, Local Development, Privacy First" />

      {/* Open Graph / Facebook / LinkedIn */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}og-image.png`} />
      <meta property="og:site_name" content="DevTool+" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
}