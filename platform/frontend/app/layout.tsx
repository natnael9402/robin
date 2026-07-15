import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Outfit, Plus_Jakarta_Sans, Space_Mono } from 'next/font/google';
import { ScrollToTop } from '../src/shared/components/ScrollToTop';
import { ServiceWorkerRegister } from '../src/shared/components/ServiceWorkerRegister';
import { ThemeProvider } from '../src/shared/contexts/ThemeContext';
import { AuthProvider } from '../src/shared/contexts/AuthContext';
import { ToastProvider } from '../src/shared/contexts/ToastContext';
import { QueryProvider } from '../src/shared/contexts/QueryProvider';
import { PremiumBackground } from '../src/shared/components/ui/PremiumBackground';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-space', display: 'swap' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f7fb' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export const metadata: Metadata = {
  title: 'Paxora Capital',
  description: 'Your Smart Trading Companion',
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t!=='light';document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: "(function(){var e='Thu, 01 Jan 2099 00:00:00 GMT';document.cookie='hs-messages-hide-welcome-message=true;expires='+e+';path=/;SameSite=Lax';try{indexedDB.databases().then(function(dbs){dbs.forEach(function(db){if(db.name&&(db.name.indexOf('hubspot')!==-1||db.name.indexOf('messages')!==-1||db.name.indexOf('hs_')!==-1)){indexedDB.deleteDatabase(db.name)}})})}catch(x){}})();" }} />
        <script dangerouslySetInnerHTML={{ __html: "(function(){var lastEl=null,obs=null;setInterval(function(){var e=document.getElementById('hubspot-messages-iframe-container');if(!e)return;e.style.setProperty('bottom','80px','important');if(e!==lastEl){if(obs)obs.disconnect();lastEl=e;obs=new MutationObserver(function(){e.style.setProperty('bottom','80px','important');if(parseInt(e.style.height)>200){e.style.setProperty('height','400px','important');}});obs.observe(e,{attributes:true,attributeFilter:['style']});}},100);})();" }} />
        <Script src="//js-eu1.hs-scripts.com/148892423.js" strategy="afterInteractive" />
      </head>
      <body className={`${jakarta.className} ${outfit.variable} ${jakarta.variable} ${spaceMono.variable} antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <ToastProvider>
                <PremiumBackground />
                <ScrollToTop />
                <ServiceWorkerRegister />
                {children}
              </ToastProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
