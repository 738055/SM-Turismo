import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GooglePixel from "@/components/GooglePixel";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Foz Turismo SM',
    default: 'Foz Turismo SM - Sua Viagem Começa Aqui',
  },
  description: "A melhor agência de turismo e transporte de Foz do Iguaçu. Passeios, transfers e roteiros personalizados com a qualidade Foz Turismo SM.",
  keywords: ["Foz Turismo SM", "Turismo", "Foz do Iguaçu", "Cataratas", "Compras Paraguai", "Van", "Transporte"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        {/* Injeta a config do Tailwind também no head para garantir compatibilidade caso use CDN */}
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['var(--font-jakarta)', 'sans-serif'],
                  },
                  colors: {
                    brand: { 50:'#FFF0FD', 100:'#FFD6FA', 200:'#FFADF5', 300:'#FF99F0', 400:'#FF8EEE', 500:'#FF88ED', 600:'#E670D4', 700:'#C455B5', 800:'#A03A96', 900:'#7D2074' },
                    dark: { 900:'#2C3229', 800:'#3D4537', 700:'#4E5845' }
                  },
                  animation: {
                    'fade-in': 'fadeIn 0.6s ease-out forwards',
                    'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  },
                  keyframes: {
                    fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                    slideUp: { '0%': { opacity: '0', transform: 'translateY(40px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } }
                  }
                }
              }
            }
          `
        }} />
      </head>
      <body className={`${jakarta.variable} font-sans bg-white text-slate-900 antialiased`}>
        <Providers>
          <GooglePixel />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}