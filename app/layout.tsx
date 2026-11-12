import type { Metadata } from "next";
import "./globals.css";
import "./brand-header.css";

export const metadata: Metadata = {
  title: "STYLE LUK | Wear Your Style",
  description: "আপনার প্রতিদিনের স্টাইলে আভিজাত্যের ছোঁয়া।",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="bn"><body>{children}</body></html>;
}
