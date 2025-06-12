// 'use client'

// import { useEffect, useState } from 'react'
// import { useParams } from 'next/navigation'
// import { auth } from '@/firebase'
// import { onAuthStateChanged, User } from 'firebase/auth'

// type Spot = {
//   id: string
//   name: string
//   state: string
//   category: string
//   image_url: string
// }

// export default function StatePage() {
//   const { stateName } = useParams()
//   const [spots, setSpots] = useState<Spot[]>([])
//   const [visited, setVisited] = useState<string[]>([])
//   const [user, setUser] = useState<User | null>(null)

//   useEffect(() => {
//     fetch(`http://localhost:8000/api/spots?state=${stateName}`)
//       .then((res) => res.json())
//       .then((data) => setSpots(data))
//   }, [stateName])

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setUser(user)
//       if (user) {
//         const token = await user.getIdToken()
//         const res = await fetch('http://localhost:8000/api/visited', {
//           headers: { Authorization: token }
//         })
//         const data = await res.json()
//         setVisited(data.visited)
//       }
//     })
//     return () => unsubscribe()
//   }, [])

//   const handleMarkVisited = async (spotId: string) => {
//     if (!user) return alert('Please log in')
//     const token = await user.getIdToken()
//     const res = await fetch('http://localhost:8000/api/visit', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: token
//       },
//       body: JSON.stringify({ spot_id: spotId })
//     })
//     if (res.ok) {
//       setVisited((prev) => [...prev, spotId])
//       alert('Marked as visited!')
//     } else {
//       alert('Failed to mark as visited.')
//     }
//   }

//   return (
//     <main className="p-6">
//       <h1 className="text-3xl font-bold mb-6">Explore {decodeURIComponent(stateName as string)}</h1>

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {spots.map((spot) => (
//           <div key={spot.id} className="border rounded-xl p-4 shadow bg-white">
//             <a href={`/spot/${spot.id}`}>
//               <img
//                 src={spot.image_url}
//                 alt={spot.name}
//                 className="w-full h-48 object-cover rounded-lg mb-3"
//               />
//               <h2 className="text-xl font-semibold text-gray-900">{spot.name}</h2>
//               <p className="text-sm text-gray-600">{spot.state} · {spot.category}</p>
//             </a>

//             {visited.includes(spot.id) ? (
//               <p className="text-green-600 font-semibold mt-2">✅ Visited</p>
//             ) : (
//               <button
//                 onClick={() => handleMarkVisited(spot.id)}
//                 className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
//               >
//                 ✅ Mark as Visited
//               </button>
//             )}
//           </div>
//         ))}
//       </div>
//     </main>
//   )
// }

// 'use client'

// import { useEffect, useState } from 'react'
// import { useParams } from 'next/navigation'

// type Spot = {
//   id: string
//   name: string
//   state: string
//   category: string
//   image_url: string
// }

// export default function StatePage() {
//   const params = useParams()
//   const stateName = decodeURIComponent(params.stateName as string)
//   const [spots, setSpots] = useState<Spot[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     fetch(`http://localhost:8000/api/spots?state=${stateName}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setSpots(data)
//         setLoading(false)
//       })
//       .catch(() => setLoading(false))
//   }, [stateName])

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-900 text-white">
//       {/* Hero */}
//       <section className="relative py-24 text-center">
//         <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black/60 to-black" />
//         <h1 className="relative z-10 text-5xl font-extrabold text-white drop-shadow-xl">
//           {stateName}
//         </h1>
//         <p className="relative z-10 text-gray-400 text-lg mt-4">
//           Top places to visit in {stateName}
//         </p>
//       </section>

//       {/* Spot List */}
//       <section className="max-w-7xl mx-auto px-6 pb-20">
//         {loading ? (
//           <p className="text-center text-gray-400">Loading...</p>
//         ) : spots.length === 0 ? (
//           <p className="text-center text-gray-500 text-lg">
//             No spots found in <span className="text-white font-semibold">{stateName}</span>.
//           </p>
//         ) : (
//           <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
//             {spots.map((spot) => (
//               <div
//                 key={spot.id}
//                 className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-4 shadow-lg hover:scale-105 transition"
//               >
//                 <a href={`/spot/${spot.id}`}>
//                   <img
//                     src={spot.image_url}
//                     alt={spot.name}
//                     className="rounded-xl mb-3 w-full h-48 object-cover"
//                   />
//                   <h3 className="text-white text-lg font-semibold">{spot.name}</h3>
//                   <p className="text-gray-300 text-sm">{spot.category}</p>
//                 </a>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>
//     </main>
//   )
// }


'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { auth } from '@/firebase'
import { onAuthStateChanged, signInWithPopup, User } from 'firebase/auth'
import { provider } from '@/firebase'

type Spot = {
  id: string
  name: string
  state: string
  category: string
  image_url: string
}

export default function StatePage() {
  const { stateName } = useParams()
  const decodedStateName = decodeURIComponent(stateName as string)
  const [spots, setSpots] = useState<Spot[]>([])
  const [visited, setVisited] = useState<string[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/spots?state=${decodedStateName}`)
      .then((res) => res.json())
      .then((data) => {
        setSpots(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [decodedStateName])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        const token = await user.getIdToken()
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/visited`, {
          headers: { Authorization: token }
        })
        const data = await res.json()
        setVisited(data.visited)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleMarkVisited = async (spotId: string) => {
    if (!user) {
      alert('Please sign in to mark spots as visited.')
      return signInWithPopup(auth, provider)
    }
    const token = await user.getIdToken()
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/visit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({ spot_id: spotId })
    })
    if (res.ok) {
      setVisited((prev) => [...prev, spotId])
      alert('✅ Marked as visited!')
    } else {
      alert('❌ Failed to mark as visited.')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-900 text-white">
      {/* Hero Section */}
      <section className="relative py-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black/60 to-black" />
        <h1 className="relative z-10 text-5xl font-extrabold text-white drop-shadow-xl">
          {decodedStateName}
        </h1>
        <p className="relative z-10 text-gray-400 text-lg mt-4">
          Explore top destinations in this state
        </p>
      </section>

      {/* Spot List Section */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {loading ? (
          <p className="text-center text-gray-400">Loading...</p>
        ) : spots.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            No spots found in{' '}
            <span className="text-white font-semibold">{decodedStateName}</span>.
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
            {spots.map((spot) => (
              <div
                key={spot.id}
                className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-4 shadow-lg hover:scale-105 transition relative group"
              >
                <a href={`/spot/${spot.id}?from=${stateName}`}>

                  <img
                    src={spot.image_url}
                    alt={spot.name}
                    className="rounded-xl mb-3 w-full h-48 object-cover group-hover:brightness-75 transition duration-300"
                  />
                  <h3 className="text-white text-lg font-semibold group-hover:underline">
                    {spot.name}
                  </h3>
                  <p className="text-sm text-gray-300">{spot.category}</p>
                </a>
                {visited.includes(spot.id) ? (
                  <span className="absolute bottom-3 right-3 text-green-400 text-xs font-semibold">
                    ✅ Visited
                  </span>
                ) : (
                  <button
                    onClick={() => handleMarkVisited(spot.id)}
                    className="absolute bottom-3 right-3 bg-green-600 hover:bg-green-700 px-3 py-1 text-xs rounded text-white transition"
                  >
                    ✅ Mark
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
