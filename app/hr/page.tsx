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
  intakeq_practitioner_id: string | null
}

export default function HRPage() {
  const [staff, setStaff] = useState<Staff[]>([])

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
  console.log("Sync started")

  const { data: appts, error } = await supabase
    .from("appointments")
    .select("practitioner_id, practitioner_name")
    .not("practitioner_id", "is", null)

  console.log("Appointments:", appts)
  console.log("Error:", error)

  if (!appts || appts.length === 0) {
    alert("No practitioners found in appointments.")
    return
  }

  const uniqueMap = new Map()

  appts.forEach((a: any) => {
    uniqueMap.set(a.practitioner_id, {
      intakeq_practitioner_id: a.practitioner_id,
      name: a.practitioner_name,
      role: "Unassigned",
      status: "Active",
    })
  })

  const practitioners = Array.from(uniqueMap.values())

  console.log("Upserting:", practitioners)

  const { error: upsertError } = await supabase
    .from("staff")
    .upsert(practitioners, {
      onConflict: "intakeq_practitioner_id",
    })

  console.log("Upsert error:", upsertError)

  if (upsertError) {
    alert("Upsert failed — check console.")
    return
  }

  alert(`Synced ${practitioners.length} staff.`)

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
            Sync From Appointments
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

              <div className="text-sm">
                {member.status}
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}