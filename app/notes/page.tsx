"use client"

import { useEffect, useMemo, useState } from "react"
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
  const [selectedPractitioner, setSelectedPractitioner] = useState<string>("")
  const [selectedService, setSelectedService] = useState<string>("")
  const [search, setSearch] = useState<string>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  useEffect(() => {
    const fetchAppointments = async () => {
      const { data } = await supabase
        .from("appointments")
        .select("*")
        .order("scheduled_start", { ascending: true })

      if (data) setAppointments(data as Appointment[])
    }

    fetchAppointments()
  }, [])

  const now = new Date()

  const enriched = useMemo(() => {
    return appointments.map((appt) => {
      const scheduled = new Date(appt.scheduled_start)
      const diffMs = now.getTime() - scheduled.getTime()
      const hoursOverdue =
        diffMs > 0 ? Math.floor(diffMs / (1000 * 60 * 60)) : 0

      let urgency: Urgency = "future"

      if (appt.note_completed) urgency = "completed"
      else if (hoursOverdue >= 24) urgency = "critical"
      else if (hoursOverdue >= 12) urgency = "high"
      else if (scheduled.toDateString() === now.toDateString())
        urgency = "medium"

      return {
        ...appt,
        scheduled,
        urgency,
        hoursOverdue,
      }
    })
  }, [appointments])

  const practitioners = Array.from(
    new Set(enriched.map((a) => a.practitioner_name || "Unknown"))
  )

  const services = Array.from(
    new Set(enriched.map((a) => a.service_name || "Unknown"))
  )

  const filtered = enriched.filter((appt) => {
    if (selectedPractitioner && appt.practitioner_name !== selectedPractitioner)
      return false

    if (selectedService && appt.service_name !== selectedService)
      return false

    if (
      search &&
      !appt.client_name?.toLowerCase().includes(search.toLowerCase())
    )
      return false

    if (startDate && new Date(appt.scheduled_start) < new Date(startDate))
      return false

    if (endDate && new Date(appt.scheduled_start) > new Date(endDate))
      return false

    return true
  })

  const urgencyRank: Record<Urgency, number> = {
    critical: 1,
    high: 2,
    medium: 3,
    future: 4,
    completed: 5,
  }

  const sorted = [...filtered].sort(
    (a, b) =>
      urgencyRank[a.urgency] - urgencyRank[b.urgency] ||
      b.hoursOverdue - a.hoursOverdue
  )

  const urgencyStyles: Record<Urgency, string> = {
    critical: "border-red-500 bg-red-50 text-red-700",
    high: "border-orange-400 bg-orange-50 text-orange-700",
    medium: "border-yellow-400 bg-yellow-50 text-yellow-700",
    future: "border-gray-200 bg-white text-gray-600",
    completed: "border-green-400 bg-green-50 text-green-700",
  }

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-semibold">Notes Oversight</h1>

      {/* FILTER BAR */}
      <div className="bg-white p-6 rounded-xl shadow-sm border grid grid-cols-5 gap-4">

        <input
          type="text"
          placeholder="Search client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2"
        />

        <select
          value={selectedPractitioner}
          onChange={(e) => setSelectedPractitioner(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Practitioners</option>
          {practitioners.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Services</option>
          {services.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border rounded px-3 py-2"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border rounded px-3 py-2"
        />

      </div>

      {/* RESULTS */}
      <div className="space-y-4">
        {sorted.map((appt) => (
          <div
            key={appt.id}
            className={`p-5 rounded-xl shadow-sm border ${
              urgencyStyles[appt.urgency]
            }`}
          >
            <div className="flex justify-between">
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

              <div className="text-sm font-semibold">
                {!appt.note_completed && appt.hoursOverdue > 0
                  ? `${appt.hoursOverdue}h overdue`
                  : appt.urgency.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}