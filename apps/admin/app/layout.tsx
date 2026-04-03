import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Dakshina Admin",
  description: "Admin command center for Dakshina Direct.",
  icons: {
    icon: "/brand/favico.png",
    shortcut: "/brand/favico.png",
    apple: "/brand/favico.png"
  }
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={manrope.variable} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
