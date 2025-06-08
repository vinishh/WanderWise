'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { auth } from '@/firebase'

type Spot = {
  id: string
  name: string
  state: string
  category: string
  image_url: string
}

type Itinerary = {
  id: string
  query: string
  itinerary: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [visitedSpots, setVisitedSpots] = useState<Spot[]>([])
  const [visitedStates, setVisitedStates] = useState<string[]>([])
  const [savedItineraries, setSavedItineraries] = useState<Itinerary[]>([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        const token = await user.getIdToken()

        try {
          // Fetch visited spots
          const visitedRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/visited-full`, {
            headers: { Authorization: token }
          })
          const visitedData = await visitedRes.json()
          setVisitedSpots(visitedData.spots)
          const states = Array.from(new Set(visitedData.spots.map((s: Spot) => s.state)))
          setVisitedStates(states)

          // Fetch saved itineraries
          const itinRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/saved-itineraries`, {
            headers: { Authorization: token }
          })
          const itinData = await itinRes.json()
          setSavedItineraries(itinData.itineraries)
        } catch (err) {
          console.error('Error loading data:', err)
        }
      } else {
        setVisitedSpots([])
        setVisitedStates([])
        setSavedItineraries([])
      }
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null)
        setVisitedSpots([])
        setVisitedStates([])
        setSavedItineraries([])
      })
      .catch((err) => console.error('Logout error:', err))
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold mb-4">Your WanderWise Profile</h1>
        <p className="text-lg text-gray-400">
          You are logged out. Please sign in to view your profile.
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-900 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-extrabold">👤 Your WanderWise Profile</h1>
            <p className="text-lg text-gray-400 mt-1">
              Welcome, <span className="font-bold text-white">{user.displayName}</span>
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-20 h-20 rounded-full shadow-lg border-2 border-white"
            />
          )}
        </div>

        {/* Logout */}
        <div className="mb-12">
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold transition"
          >
            🚪 Logout
          </button>
        </div>

        {/* Visited States */}
        {visitedStates.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-2">🗺 Visited States ({visitedStates.length}/50)</h2>
            <div className="flex flex-wrap gap-2">
              {visitedStates.map((state) => (
                <span
                  key={state}
                  className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                >
                  {state}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Visited Spots */}
        {visitedSpots.length > 0 ? (
          <>
            <h2 className="text-2xl font-semibold mb-6">📍 Visited Spots</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mb-10">
              {visitedSpots.map((spot) => (
                <div
                  key={spot.id}
                  className="group border border-white/10 backdrop-blur-md bg-white/5 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                >
                  <a href={`/spot/${spot.id}`}>
                    <img
                      src={spot.image_url}
                      alt={spot.name}
                      className="w-full h-48 object-cover group-hover:brightness-75 transition"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-1 group-hover:underline">
                        {spot.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {spot.state} · {spot.category}
                      </p>
                    </div>
                  </a>
                </div>
              ))}
            </div>

            {/* Clear Visited */}
            <button
              onClick={async () => {
                const token = await user.getIdToken()
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/visited`, {
                  method: 'DELETE',
                  headers: { Authorization: token }
                })
                const data = await res.json()
                alert(data.message || 'Cleared!')
                setVisitedSpots([])
                setVisitedStates([])
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-medium transition"
            >
              🧹 Clear Visited Spots
            </button>
          </>
        ) : (
          <p className="text-gray-400 text-lg">You haven’t marked any spots yet.</p>
        )}

        {/* Saved Itineraries */}
        {savedItineraries.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-semibold mb-4">📚 Saved Itineraries</h2>
            <ul className="space-y-6">
              {savedItineraries.map((item) => (
                <li key={item.id} className="bg-white/10 border border-white/10 rounded-xl p-4 text-sm whitespace-pre-wrap text-gray-100">
                  <p className="text-pink-400 font-semibold mb-2">{item.query}</p>
                  <div className="text-gray-300">{item.itinerary}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  )
}
