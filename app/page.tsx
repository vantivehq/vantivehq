"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Home() {
  const [practitioners, setPractitioners] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    fetchPractitioners()
    fetchAppointments()
  }, [])

  async function fetchPractitioners() {
    const { data, error } = await supabase
      .from("practitioners")
      .select("*")

    if (error) setError(error)
    else setPractitioners(data || [])
  }

  async function fetchAppointments() {
    const { data, error } = await supabase
      .from("appointments")
.select("*")
.eq("status", "completed")
.eq("note_completed", false)

    if (error) setError(error)
    else setAppointments(data || [])
  }

  async function updateRole(id: string, newRole: string) {
    const { error } = await supabase
      .from("practitioners")
      .update({ role: newRole })
      .eq("id", id)

    if (error) {
      setError(error)
    } else {
      fetchPractitioners()
    }
  }

  return (
    <main className="flex min-h-screen items-center flex-col gap-8 p-10">
      <h1 className="text-3xl font-bold">VantiveHQ Admin</h1>

      {error && <p className="text-red-500">{error.message}</p>}

      {/* Practitioners Section */}
      <div className="w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-4">Practitioner Roles</h2>

        {practitioners.map((p) => (
          <div
            key={p.id}
            className="border p-4 rounded mb-4 flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{p.intakeq_name}</p>
              <p className="text-sm text-gray-500">Current Role: {p.role}</p>
            </div>

            <select
              value={p.role}
              onChange={(e) => updateRole(p.id, e.target.value)}
              className="border rounded p-1"
            >
              <option value="unassigned">Unassigned</option>
              <option value="nurse">Nurse</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
        ))}
      </div>

      {/* Appointments Section */}
      <div className="w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-4">Appointments</h2>

        {appointments.map((a) => (
          <div key={a.id} className="border p-4 rounded mb-4">
            <p><strong>Practitioner:</strong> {a.practitioner_name}</p>
            <p><strong>Status:</strong> {a.status}</p>
            <p>
              <strong>Note Status:</strong>{" "}
              {a.note_completed ? (
                <span className="text-green-600">Complete</span>
              ) : (
                <span className="text-red-600">Needs Note</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}