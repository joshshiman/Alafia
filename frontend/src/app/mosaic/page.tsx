"use client"

import { Fraunces } from "next/font/google"
import { Inter } from "next/font/google"
import Image from "next/image"
import { Share, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

// Mock data for content cards
const mockContent = [
  {
    id: 1,
    title: "Leadership Insights",
    description: "Key strategies from successful leaders in tech",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 2,
    title: "Innovation Stories",
    description: "Breaking barriers in STEM fields",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 3,
    title: "Community Impact",
    description: "Making a difference through technology",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 4,
    title: "Tech Trends",
    description: "Latest developments in technology",
    image: "/placeholder.svg?height=400&width=600",
  },
]

export default function MosaicPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const scrollAmount = container.clientWidth * 0.8
    const newScrollPosition = container.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount)

    container.scrollTo({
      left: newScrollPosition,
      behavior: "smooth",
    })
  }

  const handleScroll = () => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth)
  }

  const shareUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("URL copied to clipboard!")
    } catch (err) {
      toast.error("Failed to copy URL")
    }
  }

  return (
    <main className={`min-h-screen w-full flex flex-col relative ${fraunces.variable} ${inter.variable}`}>
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1b0707] via-[#8B3A1D] to-[#C17F59] -z-10" />

      <div className="flex flex-col flex-1 px-6 py-8 md:px-12 lg:px-24">
        {/* Logo */}
        <div className="w-32 md:w-40 h-12 relative mb-12">
          <Image
            src="/Alafia-Logo.svg?height=48&width=160"
            alt="Alafia Logo"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl text-white text-center font-serif mb-12">Your Alafia Mosaic</h1>

        {/* Content Carousel */}
        <div className="relative group">
          {/* Scroll buttons */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Scrolling container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {mockContent.map((content) => (
              <div
                key={content.id}
                className="min-w-[300px] md:min-w-[400px] bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden snap-center transform transition-all hover:scale-[1.02] hover:bg-white/15"
              >
                <div className="relative h-48 md:h-64">
                  <Image src={content.image || "/placeholder.svg"} alt={content.title} fill className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-serif text-white mb-2">{content.title}</h3>
                  <p className="text-white/80">{content.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Share section */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex w-full max-w-xl gap-2">
            <Input
              value={typeof window !== "undefined" ? window.location.href : ""}
              readOnly
              className="bg-white/10 border-white/20 text-white"
            />
            <Button onClick={shareUrl} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          <p className="text-white/60 text-sm">Share with your friends</p>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-[#1b0707] text-center text-white font-sans text-sm py-4">
        made with <span className="text-red-500">❤️</span> for NSBE Hacks 2025
      </div>
    </main>
  )
}

// Add this CSS to hide scrollbars while maintaining scroll functionality
const styles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`

