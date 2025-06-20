'use client'

import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { auth, provider } from '@/firebase'
import Navbar from './components/Navbar'
import { motion } from 'framer-motion'
import useSWR from 'swr'

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'

type Spot = {
  id: string
  name: string
  state: string
  category: string
  image_url: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function HomePage() {
  const router = useRouter()

  const [spots, setSpots] = useState<Spot[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [visited, setVisited] = useState<string[]>([])
  const [tooltipContent, setTooltipContent] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)
  const [newSpotName, setNewSpotName] = useState("")
  const [newSpotState, setNewSpotState] = useState("")
  const [useLocalCache, setUseLocalCache] = useState(true)

  // Load from localStorage if cache exists and is fresh
  useEffect(() => {
    const local = localStorage.getItem('spots')
    const time = localStorage.getItem('spots_cache_time')

    if (local && time) {
      const age = Date.now() - parseInt(time)
      const oneDay = 24 * 60 * 60 * 1000

      if (age < oneDay) {
        setSpots(JSON.parse(local))
        setUseLocalCache(true)
        setLoading(false)
      } else {
        localStorage.removeItem('spots')
        localStorage.removeItem('spots_cache_time')
        setUseLocalCache(false)
      }
    } else {
      setUseLocalCache(false)
    }
  }, [])

  // Fetch fresh data if not using cache
  const { data } = useSWR(
    !useLocalCache ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/spots` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )

  // Save fresh data to localStorage when received
  useEffect(() => {
    if (data) {
      localStorage.setItem('spots', JSON.stringify(data))
      localStorage.setItem('spots_cache_time', Date.now().toString())
      setSpots(data)
      setLoading(false)
    }
  }, [data])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        const token = await user.getIdToken()
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/visited`, {
            headers: { Authorization: token }
          })
          const data = await res.json()
          setVisited(data.visited)
        } catch {}
      } else {
        setVisited([])
      }
    })

    return () => unsubscribe()
  }, [])

  const handleLogin = () => signInWithPopup(auth, provider)
  const handleLogout = () => signOut(auth)

  const handleMarkVisited = async (spotId: string) => {
    if (!user) return alert('Login to mark spots as visited.')
    const token = await user.getIdToken()
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/visit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({ spot_id: spotId })
    })
    if (res.ok) setVisited((prev) => [...prev, spotId])
  }

  const handleAddSpot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSpotName.trim()) return
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/add-spot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSpotName, state: newSpotState || null })
    })
    if (res.ok) {
      const newSpot = await res.json()
      alert("✅ Spot added successfully!")
      setSpots((prev) => [...prev, newSpot])
      setNewSpotName("")
      setNewSpotState("")
    } else {
      const err = await res.json()
      alert(`❌ Failed: ${err.error || "Unknown error"}`)
    }
  }

  const visitedStates = Array.from(
    new Set(
      spots
        .filter((spot) => visited.includes(spot.id))
        .map((spot) => spot.state)
    )
  )

  const filteredSpots = spots.filter((spot) =>
    spot.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    // <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-900 text-white px-4 pb-20">
    <motion.main
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-900 text-white px-4 pb-20"
  >
      <Navbar />

      {/* Hero */}
      <section className="relative h-screen w-full flex flex-col justify-center items-center text-center px-6">
  <div className="absolute inset-0 bg-gradient-to-br from-sky-900/80 via-indigo-900/70 to-black/80 backdrop-blur-lg z-0" />
  <div className="relative z-10 max-w-4xl">
    <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-yellow-400 to-green-400 drop-shadow-lg leading-tight">
      Discover America <br /> One Spot at a Time
    </h1>
    <p className="mt-6 text-lg text-gray-300 max-w-xl mx-auto">
      Plan your next adventure with AI-powered itineraries, real photos, and interactive maps.
    </p>

    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
      <a
        href="#map"
        className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:scale-105 transition shadow"
      >
        🗺️ Explore Map
      </a>
      <a
        href="/itinerary"
        className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:scale-105 transition shadow"
      >
        ✨ Generate Trip
      </a>
    </div>
  </div>
</section>

<section
  id="map"
  className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden text-white pt-44"
>
  {/* 🇺🇸 Flag-inspired background overlay */}
  <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#1f1f2f] via-[#0c0c0c] to-[#1a1a1a]" />
  <div className="absolute inset-0 z-0 pointer-events-none opacity-10 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]" />
  <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-br from-red-600/20 via-white/10 to-blue-800/20 opacity-30 z-0" />

  {/* Stars behind title */}
  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-0 text-white/10 text-9xl font-extrabold pointer-events-none select-none">
    ★ ★ ★
  </div>

  {/* Section title */}
  <div className="relative z-10 text-center mb-4 px-6">
    <h2 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
      Explore the U.S. Map
    </h2>
    <p className="mt-2 text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
      Hover over a state to see its name. Click to explore iconic spots across the country.
    </p>
  </div>

  {/* Map itself */}
  <div className="relative z-10 w-full max-w-7xl px-4 mt-0">
    <ComposableMap
      projection="geoAlbersUsa"
      width={1080}
      height={750}
      className="w-full"
    >
      <Geographies geography="https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json">
      {({ geographies }: { geographies: any[] }) =>
          geographies.map((geo) => {
            const stateName = geo.properties.name
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() =>
                  router.push(`/state/${encodeURIComponent(stateName)}`)
                }
                onMouseEnter={(e: React.MouseEvent<SVGElement, MouseEvent>) => {

                  setTooltipContent(stateName)
                  setTooltipPosition({ x: e.clientX, y: e.clientY })
                }}
                onMouseLeave={() => {
                  setTooltipContent(null)
                  setTooltipPosition(null)
                }}
                style={{
                  default: {
                    fill: visitedStates.includes(stateName)
                      ? '#4ade80'
                      : '#2a2a2a',
                    outline: 'none',
                    cursor: 'pointer'
                  },
                  hover: {
                    fill: '#888',
                    outline: 'none'
                  },
                  pressed: {
                    fill: '#666',
                    outline: 'none'
                  }
                }}
              />
            )
          })
        }
      </Geographies>
    </ComposableMap>
  </div>

  {/* Tooltip */}
  {tooltipContent && tooltipPosition && (
    <div
      className="pointer-events-none fixed z-50 bg-white text-black text-sm px-3 py-1 rounded shadow border border-gray-300"
      style={{
        top: tooltipPosition.y + 12,
        left: tooltipPosition.x + 12
      }}
    >
      {tooltipContent}
    </div>
  )}

  {/* Scroll */}
  <div className="absolute bottom-6 z-10 flex flex-col items-center text-gray-300 animate-pulse">
    <div className="text-xs font-medium tracking-wider mb-1">
      Scroll to Discover More
    </div>
    <div className="w-5 h-5 border-b-2 border-r-2 border-white rotate-45"></div>
  </div>
</section>



      {/* Search + Add */}
      <section id="discover" className="pt-24 pb-28 bg-black px-4">
  {/* Search + Add Section */}
  <motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: 'easeOut' }}
  viewport={{ once: true }}
  className="relative w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl px-6 py-8 sm:px-10 sm:py-10 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden"
>
  {/* Glow aura */}
  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-pink-500/20 via-white/10 to-blue-500/20 opacity-20 blur-2xl pointer-events-none z-0" />

  {/* Search */}
  <div className="relative z-10 space-y-4">
    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
      <span>🔍</span> Search for a Spot
    </h2>
    <input
      type="text"
      placeholder="Try 'Grand Canyon'..."
      className="w-full rounded-md px-4 py-3 bg-white text-black placeholder-gray-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>

  {/* Add */}
  <div className="relative z-10 space-y-4">
    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
      <span>➕</span> Can’t find it? Add a Spot
    </h2>
    <form onSubmit={handleAddSpot} className="space-y-3">
      <input
        type="text"
        placeholder="📍 Spot name"
        className="w-full rounded-md px-4 py-3 bg-white text-black placeholder-gray-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        value={newSpotName}
        onChange={(e) => setNewSpotName(e.target.value)}
        required
      />
      <select
        value={newSpotState}
        onChange={(e) => setNewSpotState(e.target.value)}
        required
        className="w-full rounded-md px-4 py-3 bg-white text-black shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      >
        <option value="">🗺️ Select a State</option>
        {[
          "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
          "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
          "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
          "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
          "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
          "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
          "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
          "Wisconsin", "Wyoming"
        ].map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="w-full rounded-md py-3 bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold transition"
      >
        Add Spot
      </button>
    </form>
  </div>
</motion.div>


  {/* Spot Cards */}
  <div className="max-w-7xl mx-auto">
    <h2 className="text-2xl font-semibold mb-6 text-white">🌟 Featured Spots</h2>
    {loading ? (
      <p className="text-gray-300">LOADING........ PLEASE WAIT IT TAKES A FEW SECONDS TO LOAD THE SPOTS</p>
    ) : (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
        {filteredSpots.map((spot) => (
          <motion.div
            key={spot.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden group rounded-2xl border border-white/20 backdrop-blur-md bg-white/10 shadow-xl"
          >
            <a href={`/spot/${spot.id}?from=home`} className="block">
              <div className="relative">
                <img
                  src={spot.image_url}
                  alt={spot.name}
                  className="w-full h-48 object-cover rounded-t-2xl group-hover:brightness-75 transition duration-300"
                />
                <span className="absolute top-3 left-3 bg-black/50 text-xs px-3 py-1 rounded-full text-white backdrop-blur-sm">
                  {spot.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-white text-lg font-semibold mb-1 group-hover:underline">
                  {spot.name}
                </h3>
                <p className="text-sm text-gray-300">{spot.state}</p>
              </div>
            </a>
            {visited.includes(spot.id) ? (
              <span className="absolute bottom-3 right-3 text-green-400 text-xs font-semibold">
                ✅ Visited
              </span>
            ) : (
              <button
                onClick={() => handleMarkVisited(spot.id)}
                className="absolute bottom-3 right-3 bg-green-600 hover:bg-green-700 px-3 py-1 text-xs rounded text-white"
              >
                ✅ Mark Visited
              </button>
            )}
          </motion.div>
        ))}
      </div>
    )}
  </div>
</section>

  </motion.main>
      // </motion.main>

    
  )
  
}
