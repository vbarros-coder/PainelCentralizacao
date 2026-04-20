/**
 * Root Layout
 * Layout raiz com identidade visual Addvalora
 */

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/features/auth/auth-context';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/ui/toast';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Central de Projetos NIE - Addvalora',
  description: 'Acesso centralizado às soluções estratégicas, operacionais e tecnológicas do Núcleo de Inteligência Estratégica - Addvalora Global',
  keywords: ['NIE', 'projetos', 'gestão', 'inteligência estratégica', 'Addvalora', 'NIE'],
  authors: [{ name: 'Addvalora Global' }],
  creator: 'Addvalora Global - Núcleo de Inteligência Estratégica',
  metadataBase: new URL('https://nie.addvalora.com'),
  openGraph: {
    title: 'Central de Projetos NIE - Addvalora',
    description: 'Acesso centralizado às soluções estratégicas do NIE',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Central de Projetos NIE',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#00A651' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
