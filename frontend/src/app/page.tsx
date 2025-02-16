import { Fraunces } from "next/font/google"
import { Inter } from "next/font/google"
import Image from "next/image"
import Link from "next/link"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export default function Page() {
  return (
    <main className={`min-h-screen w-full flex flex-col relative ${fraunces.variable} ${inter.variable}`}>
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1b0707] via-[#8B3A1D] to-[#C17F59] -z-10" />

      <div className="flex flex-col flex-1 px-6 py-8 md:px-12 lg:px-24">
        {/* Logo */}
        <div className="w-32 md:w-40">
          <Image 
            src="/alafia-logo.svg"  // This path is relative to the public folder
            alt="Alafia Logo"
            width={160}
            height={40}
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center max-w-4xl">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-foreground leading-tight mb-6">
            Get inspired by talented leaders
          </h1>

          <p className="font-sans text-xl md:text-2xl text-muted mb-12 max-w-2xl">
            Alafia enables underrepresented groups to gain greater visibility and strength with unity
          </p>

          {/* Glowing button */}
          <Link href="/survey">
            <button className="inline-flex items-center justify-center w-fit px-8 py-4 text-lg font-medium text-black bg-accent rounded-full transition-all hover:scale-105 hover:brightness-110 shadow-[0_0_20px_rgba(217,217,217,0.3)] hover:shadow-[0_0_30px_rgba(217,217,217,0.5)]">
              Get Started
            </button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-[#1b0707] text-center text-white font-sans text-sm py-4">
        made with <span className="text-red-500">❤️</span> for NSBE Hacks 2025
      </div>
    </main>
  )
}

