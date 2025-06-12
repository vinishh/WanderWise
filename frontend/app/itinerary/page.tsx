// 'use client'

// import { useState } from 'react'

// export default function ItineraryPage() {
//   const [query, setQuery] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [result, setResult] = useState<string | null>(null)

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     setResult(null)

//     try {
//       const res = await fetch('http://localhost:8000/api/itinerary', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ query })
//       })
//       const data = await res.json()
//       setResult(data.itinerary)
//     } catch (err) {
//       setResult('Failed to generate itinerary. Try again.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <main className="max-w-2xl mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-4">AI Travel Itinerary</h1>

//       <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Enter a state or place (e.g. California)"
//           className="flex-1 p-2 border rounded"
//           required
//         />
//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
//         >
//           {loading ? 'Loading...' : 'Generate'}
//         </button>
//       </form>

//       {result && (
//         <div className="whitespace-pre-line bg-white text-gray-800 p-4 rounded shadow text-sm">
//           {result}
//         </div>
//       )}
//     </main>
//   )
// }


'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/firebase'
import { onAuthStateChanged, User } from 'firebase/auth'

export default function ItineraryPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [saved, setSaved] = useState<any[]>([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const token = await u.getIdToken()
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/saved-itineraries`, {
            headers: { Authorization: token }
          })
          const data = await res.json()
          setSaved(data.itineraries)
        } catch (e) {
          console.error('Failed to fetch saved itineraries')
        }
      }
    })
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setSaveStatus(null)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      const data = await res.json()
      setResult(data.itinerary)
    } catch (err) {
      setResult('❌ Failed to generate itinerary. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user || !result) return alert('Please log in to save your itinerary.')

    const token = await user.getIdToken()
    setSaveStatus('Saving...')

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/save-itinerary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({
        query,
        itinerary: result
      })
    })

    if (res.ok) {
      setSaveStatus('✅ Itinerary saved!')
      const refresh = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/saved-itineraries`, {
        headers: { Authorization: token }
      })
      const savedData = await refresh.json()
      setSaved(savedData.itineraries)
    } else {
      setSaveStatus('❌ Failed to save.')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-900 text-white py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Top Header Row with Back Button and Title */}
        <div className="flex items-center justify-between mb-6">
          <a
            href="/"
            className="text-sm text-white hover:text-purple-400 transition mt-4"
          >
            ← Back to Home
          </a>
          <h1 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-pink-500 to-yellow-400 bg-clip-text text-transparent drop-shadow text-center w-full -ml-6 sm:-ml-12">
            🧠 AI Travel Itinerary
          </h1>
        </div>

        <p className="text-gray-400 text-lg mb-10 text-center">
          Describe your dream trip and let WanderWise build the perfect itinerary for you.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 3-day road trip in Utah"
            className="w-full sm:w-2/3 p-3 rounded-lg bg-white text-black placeholder-gray-500 shadow"
            required
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 transition px-6 py-3 rounded-lg text-white font-semibold shadow"
          >
            {loading ? 'Loading...' : '✨ Generate'}
          </button>
        </form>

        {result && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl text-left whitespace-pre-line text-sm sm:text-base text-gray-200">
            {result}
            <div className="mt-6 text-right">
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition"
              >
                💾 Save Itinerary
              </button>
              {saveStatus && (
                <p className="text-sm mt-2 text-gray-300">{saveStatus}</p>
              )}
            </div>
          </div>
        )}

        {saved.length > 0 && (
          <div className="mt-16 text-left">
            <h2 className="text-2xl font-bold mb-4">📚 Your Saved Itineraries</h2>
            <ul className="space-y-4">
              {saved.map((item) => (
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
