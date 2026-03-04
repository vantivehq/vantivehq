"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Staff = {
  id: string
  name: string
  role: string
  status: string
}

export default function HRPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(false)

  const fetchStaff = async () => {
    const { data } = await supabase
      .from("staff")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) setStaff(data as Staff[])
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  const syncFromAppointments = async () => {
    setLoading(true)

    const { data: appts } = await supabase
      .from("appointments")
      .select("practitioner_name")
      .not("practitioner_name", "is", null)

    if (!appts || appts.length === 0) {
      alert("No practitioners found in appointments.")
      setLoading(false)
      return
    }

    const unique = new Map()

    appts.forEach((a: any) => {
      if (a.practitioner_name) {
        unique.set(a.practitioner_name, {
          name: a.practitioner_name,
          role: "Unassigned",
          status: "Active",
        })
      }
    })

    const practitioners = Array.from(unique.values())

    const { error } = await supabase
      .from("staff")
      .upsert(practitioners, {
        onConflict: "name",
      })

    if (error) {
      console.error(error)
      alert("Sync failed")
    } else {
      alert(`Synced ${practitioners.length} staff`)
    }

    setLoading(false)
    fetchStaff()
  }

  return (
    <div className="space-y-8">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">HR Portal</h1>

        <div className="flex gap-4">

          <button
            onClick={syncFromAppointments}
            className="bg-[#6B8E6B] text-white px-4 py-2 rounded-lg shadow hover:opacity-90"
          >
            {loading ? "Syncing..." : "Sync Staff"}
          </button>

          <Link
            href="/hr/new"
            className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:opacity-90"
          >
            + Add Staff
          </Link>

        </div>
      </div>

      <div className="space-y-4">

        {staff.length === 0 && (
          <div className="bg-white p-6 rounded-xl border">
            <p className="text-gray-500">
              No staff yet. Add one manually or sync from appointments.
            </p>
          </div>
        )}

        {staff.map((member) => (
          <Link
            key={member.id}
            href={`/hr/${member.id}`}
            className="block bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">

              <div>
                <p className="font-semibold text-lg">
                  {member.name}
                </p>

                <p className="text-sm text-gray-600">
                  {member.role}
                </p>
              </div>

              <div className="text-sm text-gray-500">
                {member.status}
              </div>

            </div>
          </Link>
        ))}

      </div>

    </div>
  )
}