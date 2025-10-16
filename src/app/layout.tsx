import "./globals.css"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import type { ReactNode } from "react"

export const metadata = {
  title: "Pasan Ramyanath | Portfolio",
  description: "My personal portfolio website built with Next.js & Tailwind CSS",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-white text-gray-800">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
