import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/constants/site";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Riththika OS", template: "%s" },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: "Riththika Baskaran — Full Stack Developer",
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Riththika Baskaran — Full Stack Developer",
    description: SITE.description,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}