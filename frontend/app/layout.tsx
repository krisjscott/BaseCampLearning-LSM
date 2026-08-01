import type { Metadata } from "next";
import { Inter } from "next/font/google";
import DemoNavigator from "./components/DemoNavigator";
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
    icon: "/BasecampExactLogo.png",
    apple: "/BasecampExactLogo.png",
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
        {children}
        <DemoNavigator />
      </body>
    </html>
  );
}
