"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Appointment = {
  id: string
  client_name: string
  practitioner_name: string
}

type Note = {
  appointment_id: string
  note_type: string
}

export default function NotesPage() {

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [notes, setNotes] = useState<Note[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {

    const { data: appts } = await supabase
      .from("appointments")
      .select("id, client_name, practitioner_name")
      .order("scheduled_start", { ascending: false })

    const { data: notesData } = await supabase
      .from("appointment_notes")
      .select("*")

    if (appts) setAppointments(appts)
    if (notesData) setNotes(notesData)
  }

  const hasNote = (appointmentId: string, type: string) => {
    return notes.some(
      (n) =>
        n.appointment_id === appointmentId &&
        n.note_type === type
    )
  }

  const statusCell = (exists: boolean) => {

    if (exists)
      return (
        <span className="text-green-600 font-medium">
          ✓
        </span>
      )

    return (
      <span className="text-red-600 font-medium">
        Missing
      </span>
    )
  }

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-semibold">
        Notes Compliance
      </h1>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">

        <table className="w-full">

          <thead className="border-b">

            <tr className="text-left">

              <th className="p-4">Client</th>
              <th className="p-4">Practitioner</th>
              <th className="p-4">Treatment</th>
              <th className="p-4">SOAP</th>

            </tr>

          </thead>

          <tbody>

            {appointments.map((appt) => {

              const treatment = hasNote(appt.id, "Treatment")
              const soap = hasNote(appt.id, "SOAP")

              return (

                <tr
                  key={appt.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-4">
                    {appt.client_name}
                  </td>

                  <td className="p-4">
                    {appt.practitioner_name}
                  </td>

                  <td className="p-4">
                    {statusCell(treatment)}
                  </td>

                  <td className="p-4">
                    {statusCell(soap)}
                  </td>

                </tr>

              )
            })}

          </tbody>

        </table>

      </div>

    </div>
  )
}