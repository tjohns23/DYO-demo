import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { getPaletteStyles } from "@/lib/theme";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        fontSans.variable
      )}
    >
      {/* Injecting getPaletteStyles() here ensures CSS variables like 
        --color-primary are available globally to Tailwind v4. 
      */}
      <body style={getPaletteStyles()}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" 
          enableSystem={false} // DYO prioritizes a grounded, intentional look
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}