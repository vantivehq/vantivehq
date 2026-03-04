import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("Webhook received:", body)

    // Get clinic
    const { data: clinic } = await supabase
      .from("clinics")
      .select("id")
      .single()

    if (!clinic) {
      console.error("No clinic found")
      return NextResponse.json({ error: "Clinic not found" }, { status: 400 })
    }

    // ==========================
    // APPOINTMENT CREATED
    // ==========================

    if (body.EventType === "AppointmentCreated" && body.Appointment) {

      const appt = body.Appointment

      const { error } = await supabase
        .from("appointments")
        .upsert({
          clinic_id: clinic.id,
          intakeq_appointment_id: appt.Id,
          intakeq_client_id: appt.ClientId?.toString(),
          practitioner_name: appt.PractitionerName,
          practitioner_id: appt.PractitionerId,
          client_name: appt.ClientName,
          service_name: appt.ServiceName,
          location_name: appt.LocationName,
          status: appt.Status,
          scheduled_start: appt.StartDateIso,
          note_completed: false,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "intakeq_appointment_id"
        })

      if (error) {
        console.error("Insert appointment error:", error)
      }

    }

    // ==========================
    // NOTE LOCKED (SMART NOTES)
    // ==========================

    if (body.Type === "Note Locked" && body.NoteId) {

      const noteId = body.NoteId

      try {

        // Fetch note details from IntakeQ
        const response = await fetch(
          `https://intakeq.com/api/v1/notes/${noteId}`,
          {
            headers: {
              "X-Auth-Key": process.env.INTAKEQ_API_KEY!,
            },
          }
        )

        const noteData = await response.json()

        const template = noteData.TemplateName || "Unknown"

        let noteType = "Other"

        const lower = template.toLowerCase()

        if (lower.includes("soap")) noteType = "SOAP"
        else if (lower.includes("treatment")) noteType = "Treatment"
        else if (lower.includes("follow")) noteType = "Follow Up"
        else if (lower.includes("consult")) noteType = "Consult"
        else if (lower.includes("lab")) noteType = "Lab"

        console.log("Detected note type:", noteType)

        // Find latest appointment for client
        const { data: appointment } = await supabase
          .from("appointments")
          .select("id")
          .eq("intakeq_client_id", body.ClientId?.toString())
          .order("scheduled_start", { ascending: false })
          .limit(1)
          .single()

        if (!appointment) {
          console.log("No appointment found for note")
          return NextResponse.json({ success: true })
        }

        // Store note record
        const { error: noteError } = await supabase
          .from("appointment_notes")
          .insert({
            appointment_id: appointment.id,
            intakeq_note_id: noteId,
            note_type: noteType
          })

        if (noteError) {
          console.error("Note insert error:", noteError)
        }

        // Mark appointment completed
        await supabase
          .from("appointments")
          .update({ note_completed: true })
          .eq("id", appointment.id)

        console.log("Stored note and marked appointment complete")

      } catch (err) {

        console.error("Note processing failed:", err)

      }

    }

    return NextResponse.json({ success: true })

  } catch (error) {

    console.error("Webhook error:", error)

    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    )

  }
}