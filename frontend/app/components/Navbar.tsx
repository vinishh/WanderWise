'use client'

import { useRouter } from 'next/navigation'
import { auth, provider } from '@/firebase'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  const handleLogin = () => signInWithPopup(auth, provider)
  const handleLogout = () => signOut(auth)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
        <h1
          onClick={() => router.push('/')}
          className="text-lg font-semibold cursor-pointer hover:opacity-90 transition"
        >
          WanderWise
        </h1>
        <nav className="flex items-center gap-5 text-sm">
          <a href="/#map" className="hover:text-purple-400 transition">🗺️ Map</a>
          <a href="/itinerary" className="hover:text-purple-400 transition">✨ Itinerary</a>
          <a href="/profile" className="hover:text-purple-400 transition">👤 Profile</a>
          {user ? (
            <button onClick={handleLogout} className="hover:text-red-400 transition">Logout</button>
          ) : (
            <button onClick={handleLogin} className="hover:text-green-400 transition">Login</button>
          )}
        </nav>
      </div>
    </header>
  )
}
