// client/app/layout.tsx
import type { Metadata } from "next";
import { Fira_Code } from "next/font/google"; // <-- 1. IMPORT Fira_Code
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut, SignUp } from "@clerk/nextjs";

// --- 2. INITIALIZE Fira_Code ---
const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code", // We'll use a CSS variable
});

export const metadata: Metadata = {
  title: "PDF AI",
  description: "Chat with your documents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        {/* --- 3. APPLY THE FONT VARIABLE --- */}
        <body className={`${firaCode.variable} antialiased`}>
          <SignedOut>
            <div className="flex justify-center items-center h-screen">
              <SignUp routing="hash" />
            </div>
          </SignedOut>
          <SignedIn>{children}</SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}