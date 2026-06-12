import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Nunito } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import "./cropper.css";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
});

const body = Nunito({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
});

const APP_NAME = "Czyj to ryj?";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s — ${APP_NAME}`,
  },
  description:
    "Teleturniej społecznościowo-satyryczny — edycja jubileuszowa 35 lat chóru Dysonans.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#f5c542",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${display.variable} ${body.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-ink text-cream"
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
