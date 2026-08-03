import type { Metadata } from "next";
import { Inter } from "next/font/google";
import DemoNavigator from "./components/DemoNavigator";
import MobileHamburgerMenu from "./components/MobileHamburgerMenu";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "BaseCamp Learning",
    template: "%s | BaseCamp Learning",
  },
  description: "A responsive BaseCamp learning portal demo with onboarding, courses, assessments, progress, and certificates.",
  applicationName: "BaseCamp Learning",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/favicon-512.png",
  },
  openGraph: {
    title: "BaseCamp Learning",
    description: "Responsive learning portal demo for onboarding, courses, assessments, and certificates.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MobileHamburgerMenu />
        {children}
        <DemoNavigator />
      </body>
    </html>
  );
}
