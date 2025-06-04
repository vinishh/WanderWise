'use client'

import { useEffect, useState } from 'react'

type Spot = {
  id: string
  name: string
  state: string
  category: string
  image: string
}

export default function Home() {
  const [spots, setSpots] = useState<Spot[]>([])

  useEffect(() => {
    fetch("http://localhost:8000/api/spots?state=California")
      .then((res) => res.json())
      .then((data) => {
        console.log("API response:", data)
        setSpots(data)
      })
  }, [])

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Explore California</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.isArray(spots) && spots.map((spot) => (
          <div key={spot.id} className="border rounded-lg p-4 shadow">
            <img src={spot.image} alt={spot.name} className="w-full h-40 object-cover rounded" />
            <h2 className="text-xl mt-2 font-semibold">{spot.name}</h2>
            <p className="text-sm text-gray-500">{spot.category}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
