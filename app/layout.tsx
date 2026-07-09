// Purpose: Provides the shared App Router HTML shell and global style imports.
import type { Metadata } from "next";
import "./globals.css";
import "../styles/public-home.css";
import "../styles/background-reaction.css";
import "../styles/workspace-app.css";
import { ThemeVariables } from "@/components/theme/ThemeVariables";
import { getInitialLanguage } from "@/lib/i18n/getInitialLanguage";

export const metadata: Metadata = {
  title: "JPY Team Workspace",
  description: "Public entrance and reserved workspace for the JPY team.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLanguage = await getInitialLanguage();

  return (
    <html
      lang={initialLanguage === "en" ? "en" : "zh-CN"}
      data-scroll-behavior="smooth"
    >
      <body>
        <ThemeVariables />
        {children}
      </body>
    </html>
  );
}
