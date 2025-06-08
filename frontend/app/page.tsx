// 'use client'

// import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
// import { useRouter } from 'next/navigation'
// import { useEffect, useState } from 'react'
// import { auth, provider } from '@/firebase'
// import {
//   signInWithPopup,
//   signOut,
//   onAuthStateChanged,
//   User
// } from 'firebase/auth'

// type Spot = {
//   id: string
//   name: string
//   state: string
//   category: string
//   image_url: string
// }

// export default function HomePage() {
//   const router = useRouter()

//   const [spots, setSpots] = useState<Spot[]>([])
//   const [searchTerm, setSearchTerm] = useState("")
//   const [loading, setLoading] = useState(true)
//   const [user, setUser] = useState<User | null>(null)
//   const [visited, setVisited] = useState<string[]>([])
//   const [tooltipContent, setTooltipContent] = useState<string | null>(null)
//   const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)
//   const [newSpotName, setNewSpotName] = useState("")
//   const [newSpotState, setNewSpotState] = useState("")

//   useEffect(() => {
//     fetch('http://localhost:8000/api/spots')
//       .then((res) => res.json())
//       .then((data) => {
//         setSpots(data)
//         setLoading(false)
//       })
//       .catch((err) => {
//         console.error('Failed to load spots:', err)
//         setLoading(false)
//       })
//   }, [])

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setUser(user)

//       if (user) {
//         const token = await user.getIdToken()
//         try {
//           const res = await fetch('http://localhost:8000/api/visited', {
//             headers: { Authorization: token }
//           })
//           const data = await res.json()
//           setVisited(data.visited)
//         } catch (err) {
//           console.error('Failed to fetch visited spots:', err)
//         }
//       } else {
//         setVisited([])
//       }
//     })

//     return () => unsubscribe()
//   }, [])

//   const handleLogin = () => {
//     signInWithPopup(auth, provider).catch((err) =>
//       console.error('Login error:', err)
//     )
//   }

//   const handleLogout = () => {
//     signOut(auth).catch((err) => console.error('Logout error:', err))
//   }

//   const handleMarkVisited = async (spotId: string) => {
//     if (!user) {
//       alert('You must be signed in to mark spots as visited.')
//       return
//     }

//     const token = await user.getIdToken()

//     try {
//       const res = await fetch('http://localhost:8000/api/visit', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: token
//         },
//         body: JSON.stringify({ spot_id: spotId })
//       })

//       if (res.ok) {
//         alert('Marked as visited!')
//         setVisited((prev) => [...prev, spotId])
//       } else {
//         alert('Failed to mark as visited.')
//       }
//     } catch (err) {
//       console.error('Error marking visited:', err)
//       alert('Something went wrong.')
//     }
//   }

//   const handleAddSpot = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!newSpotName.trim()) return
  
//     try {
//       const res = await fetch("http://localhost:8000/api/add-spot", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: newSpotName,
//           state: newSpotState || null
//         })
//       })
  
//       if (res.ok) {
//         const newSpot = await res.json()
//         alert("✅ Spot added successfully!")
//         setSpots((prev) => [...prev, newSpot])
//         setNewSpotName("")
//         setNewSpotState("")
//       } else {
//         const err = await res.json()
//         alert(`❌ Failed: ${err.error || "Unknown error"}`)
//       }
//     } catch (err) {
//       console.error("Add Spot Error:", err)
//       alert("❌ Something went wrong while adding the spot.")
//     }
//   }
  

//   const visitedStates = Array.from(
//     new Set(
//       spots
//         .filter((spot) => visited.includes(spot.id))
//         .map((spot) => spot.state)
//     )
//   )

//   const allStates = [
//     "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
//     "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
//     "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
//     "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
//     "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
//     "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
//     "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
//     "Wisconsin", "Wyoming"
//   ]

//   const filteredSpots = spots.filter((spot) =>
//     spot.name.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   return (
//     <main className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Explore the U.S.</h1>
//         {user ? (
//           <div className="flex items-center gap-4">
//             <p className="text-gray-700">Welcome, {user.displayName}</p>
//             <button
//               onClick={handleLogout}
//               className="bg-red-500 text-white px-4 py-2 rounded"
//             >
//               Logout
//             </button>
//           </div>
//         ) : (
//           <button
//             onClick={handleLogin}
//             className="bg-blue-600 text-white px-4 py-2 rounded"
//           >
//             Sign in with Google
//           </button>
//         )}
//       </div>

//       {/* State dropdown */}
//       <div className="mb-4 max-w-xs">
//         <label htmlFor="state-select" className="block mb-1 text-sm font-medium text-gray-200">
//           Select a State
//         </label>
//         <select
//           id="state-select"
//           className="w-full bg-neutral-800 text-white border border-gray-600 rounded-md p-2"
//           onChange={(e) => {
//             const selected = e.target.value
//             if (selected) {
//               router.push(`/state/${encodeURIComponent(selected)}`)
//             }
//           }}
//           defaultValue=""
//         >
//           <option value="" disabled>Choose a state</option>
//           {allStates.map((state) => (
//             <option key={state} value={state}>{state}</option>
//           ))}
//         </select>
//       </div>

//       {/* US Map */}
//       <>
//         <ComposableMap
//           projection="geoAlbersUsa"
//           width={980}
//           height={800}
//           className="w-full max-w-5xl mx-auto mb-6"
//         >
//           <Geographies geography="https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json">
//             {({ geographies }) =>
//               geographies.map((geo) => {
//                 const stateName = geo.properties.name
//                 return (
//                   <Geography
//                     key={geo.rsmKey}
//                     geography={geo}
//                     onClick={() =>
//                       router.push(`/state/${encodeURIComponent(stateName)}`)
//                     }
//                     onMouseEnter={(e) => {
//                       setTooltipContent(stateName)
//                       setTooltipPosition({ x: e.clientX, y: e.clientY })
//                     }}
//                     onMouseLeave={() => {
//                       setTooltipContent(null)
//                       setTooltipPosition(null)
//                     }}
//                     style={{
//                       default: {
//                         fill: visitedStates.includes(stateName)
//                           ? '#4ade80'
//                           : '#DDD',
//                         outline: 'none',
//                         cursor: 'pointer'
//                       },
//                       hover: {
//                         fill: '#AAA',
//                         outline: 'none'
//                       },
//                       pressed: {
//                         fill: '#666',
//                         outline: 'none'
//                       }
//                     }}
//                   />
//                 )
//               })
//             }
//           </Geographies>
//         </ComposableMap>

//         {tooltipContent && tooltipPosition && (
//           <div
//             className="pointer-events-none fixed z-50 bg-black text-white text-sm px-2 py-1 rounded shadow"
//             style={{ top: tooltipPosition.y + 10, left: tooltipPosition.x + 10 }}
//           >
//             {tooltipContent}
//           </div>
//         )}
//       </>

//       {/* Action buttons */}
//       <div className="flex flex-wrap gap-4 mb-4">
//         <a
//           href="/itinerary"
//           className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
//         >
//           ✨ Generate AI Trip
//         </a>

//         <a
//           href="/profile"
//           className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
//         >
//           👤 View Profile
//         </a>
//       </div>

//       {/* Search bar below buttons
//       <input
//         type="text"
//         placeholder="Search for any spot here..."
//         className="w-full max-w-md mb-6 p-2 rounded border border-gray-600 bg-white text-black placeholder-gray-500"

//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//       /> */}


//       <div className="flex flex-col sm:flex-row gap-4 mb-6 w-full max-w-3xl">
//         {/* Search bar */}
//         <input
//           type="text"
//           placeholder="Search for any spot here..."
//           className="flex-1 p-2 rounded border border-gray-600 bg-white text-black placeholder-gray-500"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />

//         {/* Add Spot Form */}
//         <form
//           onSubmit={handleAddSpot}
//           className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto"
//         >
//           <input
//             type="text"
//             placeholder="Enter new place name you wanna add"
//             className="p-2 rounded border border-gray-600 bg-white text-black placeholder-gray-500 flex-1"
//             value={newSpotName}
//             onChange={(e) => setNewSpotName(e.target.value)}
//             required
//           />
//           <input
//             type="text"
//             placeholder="state of the new place"
//             className="p-2 rounded border border-gray-600 bg-white text-black placeholder-gray-500 flex-1"
//             value={newSpotState}
//             onChange={(e) => setNewSpotState(e.target.value)}
//           />
//           <button
//             type="submit"
//             className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap"
//           >
//             ➕ Add Spot
//           </button>
//         </form>
//       </div>


//       {/* Spot Cards */}
//       {loading ? (
//         <p>Loading...</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
//           {filteredSpots.map((spot) => (
//             <div
//               key={spot.id}
//               className="relative group border rounded-xl shadow hover:shadow-md transition bg-white"
//             >
//               <a href={`/spot/${spot.id}`} className="block p-4">
//                 <img
//                   src={spot.image_url}
//                   alt={spot.name}
//                   className="w-full h-48 object-cover rounded-lg mb-3"
//                 />
//                 <h2 className="text-xl font-semibold text-gray-900 group-hover:underline">
//                   {spot.name}
//                 </h2>
//                 <p className="text-sm text-gray-600">
//                   {spot.state} · {spot.category}
//                 </p>
//               </a>

//               {visited.includes(spot.id) ? (
//                 <div className="absolute top-2 right-2 bg-white text-green-600 font-semibold px-2 py-1 rounded shadow">
//                   ✅ Visited
//                 </div>
//               ) : (
//                 <button
//                   onClick={() => handleMarkVisited(spot.id)}
//                   className="absolute bottom-2 right-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
//                 >
//                   ✅ Mark as Visited
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </main>
//   )
// }


// // frontend/app/page.tsx
// 'use client'

// import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
// import { useRouter } from 'next/navigation'
// import { useEffect, useState } from 'react'
// import { auth, provider } from '@/firebase'
// import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth'

// // Import your new components
// import HeroSection from './components/HeroSection'
// import MapSection from './components/MapSection'
// import SpotlightSection from './components/SpotlightSection'

// export type Spot = {
//   id: string
//   name: string
//   state: string
//   category: string
//   image_url: string
//   description?: string
// }

// export default function HomePage() {
//   const router = useRouter()
//   const [spots, setSpots] = useState<Spot[]>([])
//   const [searchTerm, setSearchTerm] = useState("")
//   const [loading, setLoading] = useState(true)
//   const [user, setUser] = useState<User | null>(null)
//   const [visited, setVisited] = useState<string[]>([])
  
//   // Fetch initial spots
//   useEffect(() => {
//     fetch('http://localhost:8000/api/spots')
//       .then((res) => res.json())
//       .then((data) => {
//         setSpots(data)
//         setLoading(false)
//       })
//       .catch((err) => {
//         console.error('Failed to load spots:', err)
//         setLoading(false)
//       })
//   }, [])

//   // Handle Auth and fetch visited spots
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       setUser(currentUser)
//       if (currentUser) {
//         try {
//           const token = await currentUser.getIdToken()
//           const res = await fetch('http://localhost:8000/api/visited', {
//             headers: { Authorization: token }
//           })
//           const data = await res.json()
//           setVisited(data.visited || [])
//         } catch (err) {
//           console.error('Failed to fetch visited spots:', err)
//           setVisited([])
//         }
//       } else {
//         setVisited([])
//       }
//     })
//     return () => unsubscribe()
//   }, [])

//   const handleLogin = () => signInWithPopup(auth, provider).catch(console.error)
//   const handleLogout = () => signOut(auth).catch(console.error)

//   const handleMarkVisited = async (spotId: string) => {
//     if (!user) {
//       alert('Please sign in to mark spots as visited.')
//       return
//     }
//     const token = await user.getIdToken()
//     try {
//       const res = await fetch('http://localhost:8000/api/visit', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', Authorization: token },
//         body: JSON.stringify({ spot_id: spotId })
//       })
//       if (res.ok) {
//         setVisited(prev => [...prev, spotId])
//       }
//     } catch (err) {
//       console.error('Error marking spot as visited:', err)
//     }
//   }

//   const handleAddSpot = async (name: string, state: string) => {
//     if (!name.trim()) return
//     try {
//       const res = await fetch("http://localhost:8000/api/add-spot", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, state: state || null })
//       })
//       if (res.ok) {
//         const newSpot = await res.json()
//         setSpots((prev) => [newSpot, ...prev]) // Add new spot to the top
//         return true // Indicate success
//       }
//       return false
//     } catch (err) {
//       console.error(err)
//       return false
//     }
//   }

//   const filteredSpots = spots.filter((spot) => 
//     spot.name.toLowerCase().includes(searchTerm.toLowerCase())
//   )
//   const visitedStates = Array.from(new Set(spots.filter(s => visited.includes(s.id)).map(s => s.state)))

//   return (
//     <main className="min-h-screen antialiased">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
//         <HeroSection user={user} onLogin={handleLogin} onLogout={handleLogout} />
        
//         <MapSection router={useRouter()} visitedStates={visitedStates} />
        
//         <SpotlightSection
//           spots={filteredSpots}
//           loading={loading}
//           visitedIds={visited}
//           onMarkVisited={handleMarkVisited}
//           onAddSpot={handleAddSpot}
//           searchTerm={searchTerm}
//           setSearchTerm={setSearchTerm}
//         />

//       </div>
//     </main>
//   )
// }



'use client'

import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { auth, provider } from '@/firebase'
import Navbar from './components/Navbar'
import { motion } from 'framer-motion'

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

  useEffect(() => {
    fetch('http://localhost:8000/api/spots')
      .then((res) => res.json())
      .then((data) => {
        setSpots(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        const token = await user.getIdToken()
        try {
          const res = await fetch('http://localhost:8000/api/visited', {
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
    const res = await fetch('http://localhost:8000/api/visit', {
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
    const res = await fetch("http://localhost:8000/api/add-spot", {
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


      {/* Map */}
      {/* <section className="relative max-w-6xl mx-auto mb-16">
        <h2 className="text-2xl font-semibold mb-4">🗺️ Click a state to explore</h2>
        <ComposableMap projection="geoAlbersUsa" className="w-full" style={{ height: 500 }}>
          <Geographies geography="https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json">
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName = geo.properties.name
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => router.push(`/state/${encodeURIComponent(stateName)}`)}
                    onMouseEnter={(e) => {
                      setTooltipContent(stateName)
                      setTooltipPosition({ x: e.clientX, y: e.clientY })
                    }}
                    onMouseLeave={() => {
                      setTooltipContent(null)
                      setTooltipPosition(null)
                    }}
                    style={{
                      default: {
                        fill: visitedStates.includes(stateName) ? '#4ade80' : '#444',
                        outline: 'none',
                        cursor: 'pointer'
                      },
                      hover: {
                        fill: '#666',
                        outline: 'none'
                      },
                      pressed: {
                        fill: '#999',
                        outline: 'none'
                      }
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>

        {tooltipContent && tooltipPosition && (
          <div
            className="pointer-events-none fixed z-50 bg-black text-white text-xs px-2 py-1 rounded shadow"
            style={{ top: tooltipPosition.y + 10, left: tooltipPosition.x + 10 }}
          >
            {tooltipContent}
          </div>
        )}
      </section> */}
<section
  id="map"
  className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden text-white"
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
    <p className="mt-4 text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
      Hover over a state to see its name. Click to explore iconic spots across the country.
    </p>
  </div>

  {/* Map itself */}
  <div className="relative z-10 w-full max-w-7xl px-4 mt-6">
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

  {/* Scroll Cue (premium style) */}
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
      <input
        type="text"
        placeholder="🗺️ State"
        className="w-full rounded-md px-4 py-3 bg-white text-black placeholder-gray-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        value={newSpotState}
        onChange={(e) => setNewSpotState(e.target.value)}
      />
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
      <p className="text-gray-300">Loading...</p>
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
            <a href={`/spot/${spot.id}`} className="block">
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
