import type { Metadata } from "next";
import { Inter, Rubik_Mono_One } from "next/font/google";
import "./globals.css";
const inter = Inter({ variable: "--font-inter", subsets: ["latin", "cyrillic"] });
const display = Rubik_Mono_One({ variable: "--font-display", subsets: ["latin", "cyrillic"], weight: "400" });
export const metadata: Metadata = { title: "ProofPage — Show what you build", description: "One page for your founder story, projects, and verified revenue." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" className={`${inter.variable} ${display.variable}`}><body>{children}</body></html>; }
