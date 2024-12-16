import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Provider from '@/context/Provider';
import { Toaster } from 'react-hot-toast';
import { cn } from '../lib/utils';
import Header from '@/components/Header';
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SRI CONSTRUCTIONS',
  icons: '/assets/logo-bg.png',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='light'>
      <Provider>
        <body className={cn(' bg-white ', inter.className)}>
          <NextTopLoader
            color='#2299DD'
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing='ease'
            speed={200}
            shadow='0 0 10px #2299DD,0 0 5px #2299DD'
          />

          <Header />
          {/* <Sidebar/> */}
          {/* <div className="bg-white">{children}</div>   */}
          {children}
          <Toaster position='top-center' toastOptions={{ duration: 4000 }} />
        </body>
      </Provider>
    </html>
  );
}
