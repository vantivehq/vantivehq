"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.push("/login")
      } else {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#F6F1E8] via-[#EFE6D8] to-[#E8DCCA] text-[#2E2A26]">

      <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-[#E2D6C5] shadow-lg p-6 flex flex-col justify-between">

        <div>

          <div className="flex items-center gap-2 mb-10">
            <div className="w-3 h-8 bg-[#6B8E6B] rounded-full" />
            <h1 className="text-xl font-semibold tracking-wide">
              Vantive
            </h1>
          </div>

          <nav className="space-y-3">

            <Link
              href="/dashboard"
              className="block px-4 py-2 rounded-lg hover:bg-[#EDE3D3] transition font-medium"
            >
              Control Center
            </Link>

            <Link
              href="/notes"
              className="block px-4 py-2 rounded-lg hover:bg-[#EDE3D3] transition font-medium"
            >
              Notes Oversight
            </Link>

            <Link
              href="/hr"
              className="block px-4 py-2 rounded-lg hover:bg-[#EDE3D3] transition font-medium"
            >
              HR Portal
            </Link>

          </nav>

        </div>

        <div className="space-y-4">

          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#EDE3D3] transition font-medium"
          >
            Logout
          </button>

          <div className="text-xs text-[#9C8F7A]">
            Elevate Health & Wellness
          </div>

        </div>

      </aside>

      <main className="flex-1 p-12">

        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-[#E5D9C7] p-10 min-h-[80vh]">
          {children}
        </div>

      </main>

    </div>
  )
}