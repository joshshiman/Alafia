"use client"

import { Fraunces } from "next/font/google"
import { Inter } from "next/font/google"
import { Mic } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import Link from "next/link"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export default function SurveyPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Check if browser supports speech recognition
  const SpeechRecognition =
    typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null

  useEffect(() => {
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.")
    }
  }, [SpeechRecognition])

  const startRecording = () => {
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.")
      return
    }

    try {
      const recognition = new SpeechRecognition()

      recognition.continuous = false
      recognition.interimResults = true

      recognition.onstart = () => {
        setIsRecording(true)
        setError(null)
      }

      recognition.onresult = (event) => {
        const current = event.resultIndex
        const transcriptResult = event.results[current][0].transcript
        setTranscript(transcriptResult)
      }

      recognition.onerror = (event) => {
        setError("Error occurred during recording: " + event.error)
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognition.start()
    } catch (err) {
      setError("Error starting recording")
      setIsRecording(false)
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

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
          {/* Progress text */}
          <p className="font-sans text-xl text-white/90 mb-6">Let&apos;s learn more about you... (1/5)</p>

          {/* Question */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white text-center mb-16">
            Who are you inspired by?
          </h1>

          {/* Microphone button */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={startRecording}
              disabled={isRecording}
              className={`
                w-24 h-24 rounded-full bg-[#f5eae5] 
                flex items-center justify-center 
                transition-all hover:scale-105 hover:brightness-110
                relative
                ${isRecording ? "ring-4 ring-white/50" : ""}
              `}
              aria-label={isRecording ? "Recording in progress" : "Start voice input"}
            >
              <Mic className={`w-10 h-10 text-black ${isRecording ? "animate-pulse" : ""}`} />

              {/* Recording animation rings */}
              {isRecording && (
                <>
                  <div className="absolute w-full h-full rounded-full bg-white/20 animate-ping" />
                  <div className="absolute w-full h-full rounded-full bg-white/10 animate-pulse" />
                </>
              )}
            </button>

            <span className="text-white/80 text-sm font-sans">{isRecording ? "Listening..." : "Tap to speak"}</span>
          </div>

          {/* Transcript display */}
          {transcript && (
            <div className="mt-8 p-4 bg-white/10 rounded-lg max-w-md w-full">
              <p className="text-white text-center">{transcript}</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/20 rounded-lg max-w-md w-full">
              <p className="text-white text-center text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-[#1b0707] text-center text-white font-sans text-sm py-4">
        made with <span className="text-red-500">❤️</span> for NSBE Hacks 2025
      </div>
    </main>
  )
}

