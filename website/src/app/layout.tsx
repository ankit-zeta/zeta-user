import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZetaGrow — Learn. Work. Grow.",
  description: "A professional digital education and verified work platform. Master high-income digital workflows, receive verifiable credentials, and access vetted client opportunities.",
  keywords: ["digital education", "freelance marketplace", "work opportunities", "professional development", "skills learning"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-bgWarm text-textMain antialiased`}>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
