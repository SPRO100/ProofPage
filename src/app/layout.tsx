import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin","cyrillic"] });
export const metadata: Metadata = { title: "ProofPage — Show what you build", description: "One page for your founder story, projects, and verified revenue." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className={geist.variable}><body>{children}</body></html>; }
