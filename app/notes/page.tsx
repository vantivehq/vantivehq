"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Urgency = "critical" | "high" | "medium" | "future" | "completed"

type Appointment = {
  id: string
  service_name: string | null
  client_name: string | null
  practitioner_name: string | null
  scheduled_start: string
  note_completed: boolean | null
}

export default function NotesPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedPractitioner, setSelectedPractitioner] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("scheduled_start", { ascending: true })

      if (!error && data) {
        setAppointments(data as Appointment[])
      }
    }

    fetchAppointments()
  }, [])

  const now = new Date()
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000)
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const enriched = appointments.map((appt) => {
    const scheduled = new Date(appt.scheduled_start)

    let urgency: Urgency = "future"

    if (appt.note_completed) {
      urgency = "completed"
    } else if (scheduled < twentyFourHoursAgo) {
      urgency = "critical"
    } else if (scheduled < twelveHoursAgo) {
      urgency = "high"
    } else if (scheduled.toDateString() === now.toDateString()) {
      urgency = "medium"
    }

    return {
      ...appt,
      scheduled,
      urgency,
    }
  })

  const urgencyRank: Record<Urgency, number> = {
    critical: 1,
    high: 2,
    medium: 3,
    future: 4,
    completed: 5,
  }

  const urgencyStyles: Record<Urgency, string> = {
    critical: "border-red-500 bg-red-50 text-red-700",
    high: "border-orange-400 bg-orange-50 text-orange-700",
    medium: "border-yellow-400 bg-yellow-50 text-yellow-700",
    future: "border-gray-200 bg-white text-gray-600",
    completed: "border-green-400 bg-green-50 text-green-700",
  }

  const filtered = selectedPractitioner
    ? enriched.filter(
        (a) => a.practitioner_name === selectedPractitioner
      )
    : enriched

  const sorted = [...filtered].sort(
    (a, b) =>
      urgencyRank[a.urgency] - urgencyRank[b.urgency] ||
      a.scheduled.getTime() - b.scheduled.getTime()
  )

  const grouped: Record<string, typeof enriched> = {}

  enriched.forEach((appt) => {
    const name = appt.practitioner_name || "Unknown"
    if (!grouped[name]) grouped[name] = []
    grouped[name].push(appt)
  })

  const practitioners = Object.entries(grouped)

  const criticalCount = enriched.filter((a) => a.urgency === "critical").length
  const highCount = enriched.filter((a) => a.urgency === "high").length
  const mediumCount = enriched.filter((a) => a.urgency === "medium").length
  const completedCount = enriched.filter((a) => a.urgency === "completed").length

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-6xl mx-auto space-y-10">

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Notes Oversight</h1>
          <p className="text-gray-500">{now.toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <StatCard label="24hr+ Critical" value={criticalCount} color="red" />
          <StatCard label="12–24hr High" value={highCount} color="orange" />
          <StatCard label="Today Pending" value={mediumCount} color="yellow" />
          <StatCard label="Completed" value={completedCount} color="green" />
        </div>

        {!selectedPractitioner && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Practitioner Accountability
            </h2>

            <div className="grid grid-cols-3 gap-6">
              {practitioners.map(([name, appts]) => {
                const critical = appts.filter((a) => a.urgency === "critical").length
                const high = appts.filter((a) => a.urgency === "high").length

                return (
                  <div
                    key={name}
                    onClick={() => setSelectedPractitioner(name)}
                    className={`cursor-pointer bg-white p-5 rounded-xl shadow-sm border transition hover:shadow-md ${
                      critical > 0
                        ? "border-red-500"
                        : high > 0
                        ? "border-orange-400"
                        : "border-gray-200"
                    }`}
                  >
                    <h3 className="font-semibold text-lg mb-3">{name}</h3>
                    <p className="text-sm text-red-600">{critical} Critical</p>
                    <p className="text-sm text-orange-600">{high} High</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">
            {selectedPractitioner
              ? `${selectedPractitioner}'s Work Queue`
              : "Work Queue"}
          </h2>

          {selectedPractitioner && (
            <div className="mb-4">
              <button
                onClick={() => setSelectedPractitioner(null)}
                className="text-sm text-blue-600 hover:underline"
              >
                ← Back to All Practitioners
              </button>
            </div>
          )}

          <div className="space-y-4">
            {sorted.map((appt) => (
              <div
                key={appt.id}
                className={`p-5 rounded-xl shadow-sm border ${
                  urgencyStyles[appt.urgency]
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      {appt.service_name || "Unknown Service"}
                    </p>
                    <p className="text-sm">
                      {appt.client_name || "Unknown Client"}
                    </p>
                    <p className="text-xs">
                      {appt.practitioner_name || "Unknown"}
                    </p>
                  </div>
                  <div className="text-right text-sm font-semibold">
                    {appt.urgency.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: "red" | "orange" | "yellow" | "green"
}) {
  const colorMap: Record<
    "red" | "orange" | "yellow" | "green",
    string
  > = {
    red: "text-red-600",
    orange: "text-orange-600",
    yellow: "text-yellow-600",
    green: "text-green-600",
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-semibold ${colorMap[color]}`}>
        {value}
      </p>
    </div>
  )
}