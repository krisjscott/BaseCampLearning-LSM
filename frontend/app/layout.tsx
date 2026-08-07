import type { Metadata } from "next";
import MobileHamburgerMenu from "./components/MobileHamburgerMenu";
import { ToastProvider } from "./components/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BaseCamp Learning",
    template: "%s | BaseCamp Learning",
  },
  description: "A responsive BaseCamp learning portal with onboarding, courses, assessments, progress, and certificates.",
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
    description: "Responsive learning portal for onboarding, courses, assessments, and certificates.",
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
      <body>
        <ToastProvider>
          <MobileHamburgerMenu />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
