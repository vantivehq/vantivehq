"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const [criticalCount, setCriticalCount] = useState(0)

  useEffect(() => {
    const fetchCritical = async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")

      const now = new Date()
      const twentyFourHoursAgo = new Date(
        now.getTime() - 24 * 60 * 60 * 1000
      )

      const critical =
        data?.filter((appt: any) => {
          const scheduled = new Date(appt.scheduled_start)
          return (
            !appt.note_completed &&
            scheduled < twentyFourHoursAgo
          )
        }).length || 0

      setCriticalCount(critical)
    }

    fetchCritical()
  }, [])

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-5xl mx-auto space-y-10">

        <h1 className="text-3xl font-semibold">
          Vantive Control Center
        </h1>

        <div className="grid grid-cols-3 gap-8">

          {/* Notes Oversight */}
          <Link
            href="/notes"
            className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-4">
              Notes Oversight
            </h2>

            {criticalCount > 0 ? (
              <p className="text-red-600 font-semibold">
                {criticalCount} Critical (24hr+)
              </p>
            ) : (
              <p className="text-green-600 font-semibold">
                No Critical Notes
              </p>
            )}

            <p className="text-gray-500 text-sm mt-4">
              View overdue, high-risk, and pending notes.
            </p>
          </Link>

          {/* HR Portal Placeholder */}
          <Link
  href="/hr"
  className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition"
>
  <h2 className="text-xl font-semibold mb-4">
    HR Portal
  </h2>

  <p className="text-gray-700 font-medium">
    Manage staff profiles & compliance
  </p>

  <p className="text-gray-500 text-sm mt-4">
    Licenses, documents, expiration tracking.
  </p>
</Link>

          {/* Med Orders Placeholder */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 opacity-70">
            <h2 className="text-xl font-semibold mb-4">
              Med Orders
            </h2>
            <p className="text-gray-500 text-sm">
              Coming soon.
            </p>
          </div>

        </div>
      </div>
    </main>
  )
}