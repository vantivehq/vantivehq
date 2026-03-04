"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [selectedPractitioner, setSelectedPractitioner] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .order("scheduled_start", { ascending: true })

      setAppointments(data || [])
    }

    fetchData()
  }, [])

  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const enriched = appointments.map((appt) => {
    const scheduled = new Date(appt.scheduled_start)

    const isOverdue =
      !appt.note_completed && scheduled < twentyFourHoursAgo

    const isToday =
      scheduled.toDateString() === now.toDateString()

    return {
      ...appt,
      scheduled,
      isOverdue,
      isToday,
    }
  })

  const filteredAppointments = selectedPractitioner
    ? enriched.filter(
        (a) => a.practitioner_name === selectedPractitioner
      )
    : enriched

  const overdueCount = enriched.filter((a) => a.isOverdue).length
  const todayCount = enriched.filter(
    (a) => a.isToday && !a.note_completed
  ).length
  const completedCount = enriched.filter(
    (a) => a.note_completed
  ).length

  const completionRate =
    enriched.length > 0
      ? Math.round(
          (completedCount / enriched.length) * 100
        )
      : 0

  const grouped = enriched.reduce((acc: any, appt) => {
    const name = appt.practitioner_name || "Unknown"

    if (!acc[name]) acc[name] = []

    acc[name].push(appt)
    return acc
  }, {})

  const practitioners = Object.entries(grouped)

  const workQueue = filteredAppointments.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1
    if (!a.isOverdue && b.isOverdue) return 1
    return a.scheduled.getTime() - b.scheduled.getTime()
  })

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-6xl mx-auto space-y-10">

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">
            Notes Oversight
          </h1>
          <p className="text-gray-500">
            {now.toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <StatCard label="24hr+ Overdue" value={overdueCount} color="red" />
          <StatCard label="Today" value={todayCount} color="yellow" />
          <StatCard label="Completed" value={completedCount} color="green" />
          <StatCard label="Completion %" value={`${completionRate}%`} />
        </div>

        {!selectedPractitioner && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Practitioner Accountability
            </h2>

            <div className="grid grid-cols-3 gap-6">
              {practitioners.map(([name, appts]: any) => {
                const overdue = appts.filter((a: any) => a.isOverdue).length
                const today = appts.filter(
                  (a: any) =>
                    a.isToday && !a.note_completed
                ).length
                const completed = appts.filter(
                  (a: any) => a.note_completed
                ).length

                return (
                  <div
                    key={name}
                    onClick={() => setSelectedPractitioner(name as string)}
                    className={`cursor-pointer bg-white p-5 rounded-xl shadow-sm border transition hover:shadow-md ${
                      overdue > 0
                        ? "border-red-400"
                        : "border-gray-200"
                    }`}
                  >
                    <h3 className="font-semibold text-lg mb-3">
                      {name}
                    </h3>

                    <div className="space-y-1 text-sm">
                      <p className="text-red-600">
                        {overdue} 24hr+ Overdue
                      </p>
                      <p className="text-yellow-600">
                        {today} Today
                      </p>
                      <p className="text-green-600">
                        {completed} Completed
                      </p>
                    </div>
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
            {workQueue.map((appt: any) => (
              <div
                key={appt.id}
                className={`bg-white p-5 rounded-xl shadow-sm border ${
                  appt.isOverdue
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      {appt.service_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appt.client_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {appt.practitioner_name}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm">
                      {appt.scheduled.toLocaleTimeString()}
                    </p>

                    {appt.note_completed ? (
                      <span className="text-green-600 text-sm font-semibold">
                        Completed
                      </span>
                    ) : appt.isOverdue ? (
                      <span className="text-red-600 text-sm font-semibold">
                        24hr+ Overdue
                      </span>
                    ) : (
                      <span className="text-yellow-600 text-sm font-semibold">
                        Pending
                      </span>
                    )}
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
  value: any
  color?: "red" | "yellow" | "green"
}) {
  const colorMap: Record<
    "red" | "yellow" | "green",
    string
  > = {
    red: "text-red-600",
    yellow: "text-yellow-600",
    green: "text-green-600",
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <p className="text-sm text-gray-500">{label}</p>
      <p
        className={`text-2xl font-semibold ${
          color ? colorMap[color] : ""
        }`}
      >
        {value}
      </p>
    </div>
  )
}