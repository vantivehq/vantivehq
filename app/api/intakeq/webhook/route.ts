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

    // 🔹 Get clinic (temporary single clinic assumption)
    const { data: clinic } = await supabase
      .from("clinics")
      .select("id")
      .single()

    if (!clinic) {
      console.error("No clinic found")
      return NextResponse.json({ error: "Clinic not found" }, { status: 400 })
    }

    // ==========================
    // 🗓 APPOINTMENT CREATED
    // ==========================
    if (body.EventType === "AppointmentCreated" && body.Appointment) {
      const appt = body.Appointment

      const { error } = await supabase.from("appointments").insert({
        clinic_id: clinic.id,
        intakeq_appointment_id: appt.Id,
        intakeq_client_id: appt.ClientId?.toString(),
        practitioner_name: appt.PractitionerName,
        status: appt.Status,
        scheduled_start: appt.StartDateIso,
        note_completed: false,
      })

      if (error) {
        console.error("Insert appointment error:", error)
      }
    }

    // ==========================
    // 📝 NOTE LOCKED
    // ==========================
    if (body.Type === "Note Locked" && body.NoteId) {
      const noteId = body.NoteId

      // Mark appointment as completed based on client ID
      const { error } = await supabase
        .from("appointments")
        .update({ note_completed: true })
        .eq("intakeq_client_id", body.ClientId?.toString())
        .eq("note_completed", false)

      if (error) {
        console.error("Update note completion error:", error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
  }
}