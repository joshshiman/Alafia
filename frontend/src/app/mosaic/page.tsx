"use client"

import { Fraunces } from "next/font/google"
import { Inter } from "next/font/google"
import Image from "next/image"
import { Share, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"
import { useGlobalState } from '../context/GlobalStateContext'; // Adjust path if necessary
import axios from 'axios';
import { ClipLoader } from "react-spinners"

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
    title: "-",
    description: "-",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 2,
    title: "",
    description: "",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 3,
    title: "",
    description: "",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: 4,
    title: "",
    description: "",
    image: "/placeholder.svg?height=400&width=600",
  },
]

export default function MosaicPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const {
    res, setRes
  } = useGlobalState();
  const [spotify, setSpotify] = useState<string>('');
  const [img, setImg] = useState<any>(null);
  const [movieLink, setMovieLink] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Post the answers to the Flask backend
        const response = await axios.post('http://localhost:5000/generate-content', {
          answers: res
        });

        // Set the response data in the 'res' state
        const { image, movie_list, playlist_id } = response.data;
        // console.log(img)

        setSpotify(playlist_id);
        setImg(image);
        setMovieLink(movie_list);
        
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setIsLoading(false); // End loading (hide spinner)
      }
    };

    // Call the fetchData function
    if (res && res.length > 0) {
      fetchData();
    }
  }, [res]); 

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
        <div className="w-32 md:w-40 h-12 relative">
        <Link href="/">
            <Image
                src="/Alafia-Logo.svg?height=48&width=160"
                alt="Alafia Logo"
                fill
                style={{ objectFit: "contain" }}
                priority
            />
        </Link>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl text-white text-center font-serif mb-12">Your Alafia Mosaic</h1>

        {isLoading && (
        <div className="spinner-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh' }}>
          <ClipLoader color="#36d7b7" size={50} />
        </div>
      )}

        {/* Content Carousel */}
        {(!isLoading && (spotify || img || movieLink)) && (
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
              <>
              <div key={content.id} className="min-w-[600px] md:min-w-[600px] bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden snap-center transform transition-all hover:bg-white/15">
                
                {
                  content.id == 1 ?
                    (<div className=" h-72 md:h-72"> {/* Adjust the height here */}
                      <iframe
                        src={`https://open.spotify.com/embed/playlist/${spotify}?theme=0`}  // Ensure `spotifyId` is a valid track ID
                        width="100%"
                        height="400px"
                        frameBorder="0"
                        allow="encrypted-media"
                        className="absolute top-0 left-0 w-full h-full rounded-xl"
                        // title={content.title}
                      ></iframe>
                      </div>)
                  :
                  content.id == 2 ?
                    (<div className=" h-72 md:h-72"> {/* Adjust the height here */}
                      <img src={img} alt="movie poster" className="absolute top-0 left-0 w-full h-full rounded-xl object-cover" onClick={() => {window.open(movieLink + '?view=grid', '_blank')}} style={{ cursor: 'pointer' }}/>
                      </div>)
                  :
                  // 21V03mGoBgLUNNfHUs8Tuc
                  (<div className=" h-72 md:h-72"> {/* Adjust the height here */}
                    <iframe
                      src={`https://open.spotify.com/embed/playlist/21V03mGoBgLUNNfHUs8Tuc?theme=0`}  // Ensure `spotifyId` is a valid track ID
                      width="100%"
                      height="400px"
                      frameBorder="0"
                      allow="encrypted-media"
                      className="absolute top-0 left-0 w-full h-full rounded-xl"
                      // title={content.title}
                    ></iframe>
                    </div>)
                }

                <div className="p-6">
                  <h3 className="text-xl font-serif text-white mb-2">{content.title}</h3>
                  <p className="text-white/80">{content.description}</p>
                </div>
              </div>
              
              </>
            ))}
          </div>
        </div>
        )
        }
        

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

