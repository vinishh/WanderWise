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
//   description?: string
//   photographer?: string
//   photographer_url?: string
// }

// export default function SpotPage() {
//   const { id } = useParams()
//   const [spot, setSpot] = useState<Spot | null>(null)
//   const [user, setUser] = useState<User | null>(null)
//   const [visited, setVisited] = useState(false)

//   useEffect(() => {
//     if (!id) return

//     fetch(`http://localhost:8000/api/spot/${id}`)
//       .then((res) => res.json())
//       .then((data) => setSpot(data))
//       .catch((err) => console.error('Error loading spot:', err))
//   }, [id])

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       setUser(user)
//       if (user && id) {
//         const token = await user.getIdToken()
//         const res = await fetch('http://localhost:8000/api/visited', {
//           headers: { Authorization: token }
//         })
//         const data = await res.json()
//         setVisited(data.visited.includes(id as string))
//       }
//     })
//     return () => unsubscribe()
//   }, [id])

//   const handleMarkVisited = async () => {
//     if (!user) return alert('Please sign in first')
//     const token = await user.getIdToken()
//     const res = await fetch('http://localhost:8000/api/visit', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: token
//       },
//       body: JSON.stringify({ spot_id: id })
//     })
//     if (res.ok) {
//       setVisited(true)
//       alert('Marked as visited!')
//     } else {
//       alert('Failed to mark as visited.')
//     }
//   }

//   if (!spot) return <p className="p-4">Loading...</p>

//   return (
//     <main className="p-6">
// <main className="p-6 text-white">
//   <h1 className="text-4xl font-bold mb-2">{spot.name}</h1>
//   <p className="text-lg text-gray-300 mb-4">
//     {spot.state} · {spot.category}
//   </p>

//   <img
//     src={spot.image_url}
//     alt={spot.name}
//     className="w-full max-w-3xl h-96 object-cover rounded-lg mb-4"
//   />

//   {spot.photographer && spot.photographer_url && (
//     <p className="text-sm text-gray-400 mt-2 mb-6">
//       Photo by{' '}
//       <a
//         href={spot.photographer_url}
//         className="underline"
//         target="_blank"
//         rel="noopener noreferrer"
//       >
//         {spot.photographer}
//       </a>{' '}
//       on{' '}
//       <a
//         href="https://unsplash.com"
//         className="underline"
//         target="_blank"
//         rel="noopener noreferrer"
//       >
//         Unsplash
//       </a>
//     </p>
//   )}

//   <h2 className="text-2xl font-semibold mb-3">About this place</h2>
//   <p className="text-base text-gray-200 whitespace-pre-line leading-relaxed">
//     {spot.description || 'No description available.'}
//   </p>
// </main>


//       {user && (
//         visited ? (
//           <p className="text-green-600 font-semibold">✅ You’ve visited this place.</p>
//         ) : (
//           <button
//             onClick={handleMarkVisited}
//             className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
//           >
//             ✅ Mark as Visited
//           </button>
//         )
//       )}
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
//   description: string
// }

// export default function SpotPage() {
//   const params = useParams()
//   const [spot, setSpot] = useState<Spot | null>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     fetch(`http://localhost:8000/api/spot/${params.id}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setSpot(data)
//         setLoading(false)
//       })
//       .catch((err) => {
//         console.error('Failed to load spot:', err)
//         setLoading(false)
//       })
//   }, [params.id])

//   if (loading) return <div className="p-10 text-white">Loading...</div>
//   if (!spot) return <div className="p-10 text-white">Spot not found.</div>

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-900 text-white">
//       {/* Header Image */}
//       <div className="relative h-[60vh] w-full overflow-hidden">
//         <img
//           src={spot.image_url}
//           alt={spot.name}
//           className="object-cover w-full h-full brightness-75"
//         />
//         <div className="absolute inset-0 bg-black/30" />
//         <div className="absolute bottom-10 left-10 z-10">
//           <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
//             {spot.name}
//           </h1>
//           <p className="text-lg text-gray-300 mt-2">
//             {spot.state} · {spot.category}
//           </p>
//         </div>
//       </div>

//       {/* Content */}
//       <section className="max-w-3xl mx-auto p-6 -mt-16 relative z-10">
//         <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl">
//           <h2 className="text-xl font-semibold text-white mb-4">📍 About this place</h2>
//           <p className="text-gray-300 leading-relaxed whitespace-pre-line">
//             {spot.description}
//           </p>
//           <button className="mt-6 px-5 py-2 rounded-full bg-green-600 hover:bg-green-700 transition text-white">
//             ✅ Mark as Visited
//           </button>
//         </div>
//       </section>
//     </main>
//   )
// }


'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { auth, provider } from '@/firebase'
import { onAuthStateChanged, signInWithPopup, User } from 'firebase/auth'

type Spot = {
  id: string
  name: string
  state: string
  category: string
  image_url: string
  description: string
  photographer?: string
  photographer_url?: string
}

export default function SpotPage() {
  const params = useParams()
  const spotId = params.id as string

  const [spot, setSpot] = useState<Spot | null>(null)
  const [loading, setLoading] = useState(true)
  const [visited, setVisited] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/spot/${spotId}`)
      .then((res) => res.json())
      .then((data) => {
        setSpot(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load spot:', err)
        setLoading(false)
      })
  }, [spotId])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user && spotId) {
        const token = await user.getIdToken()
        const res = await fetch('${process.env.NEXT_PUBLIC_API_BASE_URL}/api/visited', {
          headers: { Authorization: token }
        })
        const data = await res.json()
        setVisited(data.visited.includes(spotId))
      }
    })
    return () => unsubscribe()
  }, [spotId])

  const handleMarkVisited = async () => {
    if (!user) {
      alert('Please sign in first.')
      return signInWithPopup(auth, provider)
    }
    const token = await user.getIdToken()
    const res = await fetch('${process.env.NEXT_PUBLIC_API_BASE_URL}/api/visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({ spot_id: spotId })
    })
    if (res.ok) {
      setVisited(true)
      alert('✅ Marked as visited!')
    } else {
      alert('❌ Failed to mark as visited.')
    }
  }

  if (loading) return <div className="p-10 text-white">Loading...</div>
  if (!spot) return <div className="p-10 text-white">Spot not found.</div>

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-neutral-900 text-white">
      {/* Header Image */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img
          src={spot.image_url}
          alt={spot.name}
          className="object-cover w-full h-full brightness-75"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-10 left-10 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            {spot.name}
          </h1>
          <p className="text-lg text-gray-300 mt-2">
            {spot.state} · {spot.category}
          </p>
        </div>
      </div>

      {/* Content */}
      <section className="max-w-3xl mx-auto p-6 -mt-16 relative z-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-4">📍 About this place</h2>
          <p className="text-gray-300 leading-relaxed whitespace-pre-line mb-6">
            {spot.description || 'No description available.'}
          </p>

          {spot.photographer && spot.photographer_url && (
            <p className="text-sm text-gray-400 mt-2 mb-4">
              Photo by{' '}
              <a
                href={spot.photographer_url}
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {spot.photographer}
              </a>{' '}
              on{' '}
              <a
                href="https://unsplash.com"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Unsplash
              </a>
            </p>
          )}

          {user && visited ? (
            <p className="text-green-400 font-semibold">✅ You’ve visited this place.</p>
          ) : (
            <button
              onClick={handleMarkVisited}
              className="mt-4 px-5 py-2 rounded-full bg-green-600 hover:bg-green-700 transition text-white"
            >
              ✅ Mark as Visited
            </button>
          )}
        </div>
      </section>
    </main>
  )
}
