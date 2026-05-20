import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prowider - Lead Distribution",
  description: "Mini Lead Distribution System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=DM+Sans:wght@400;500&family=JetBrains+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-surface flex flex-col">
        <header className="bg-white border-b border-soft sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <a href="/" className="font-display font-bold text-xl text-primary hover:text-primary-light transition-colors">
              Prowider
            </a>
            <nav className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium">
              <a href="/request-service" className="whitespace-nowrap text-muted hover:text-primary transition-colors">Request Service</a>
              <a href="/dashboard" className="whitespace-nowrap text-muted hover:text-primary transition-colors">Dashboard</a>
              <a href="/test-tools" className="whitespace-nowrap text-muted hover:text-primary transition-colors">Test Tools</a>
            </nav>
          </div>
        </header>
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
