import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import UserProfile from "@/components/UserProfile";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yu-Gi-Oh! App",
  description: "Yu-Gi-Oh! Deck Builder and Duel Simulator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <UserProfile />
        </Providers>
      </body>
    </html>
  );
}
