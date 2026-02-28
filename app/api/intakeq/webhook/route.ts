import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)


export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("Webhook received:", body)

    // 🔹 Get clinic (single clinic assumption for now)
    const { data: clinic } = await supabase
      .from("clinics")
      .select("id")
      .single()

    if (!clinic) {
      console.error("No clinic found")
      return NextResponse.json(
        { error: "Clinic not found" },
        { status: 400 }
      )
    }

    // ==========================
    // 🗓 APPOINTMENT CREATED
    // ==========================
    if (body.EventType === "AppointmentCreated" && body.Appointment) {
      const appt = body.Appointment

      const { error } = await supabase
        .from("appointments")
        .upsert(
          {
            clinic_id: clinic.id,
            intakeq_appointment_id: appt.Id,
            intakeq_client_id: appt.ClientId?.toString(),

            // 👇 External IntakeQ practitioner ID
            intakeq_practitioner_id: appt.PractitionerId,

            practitioner_name: appt.PractitionerName,
            client_name: appt.ClientName,
            service_name: appt.ServiceName,
            location_name: appt.LocationName,

            status: appt.Status,
            scheduled_start: appt.StartDateIso,
            note_completed: false,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "intakeq_appointment_id",
          }
        )

      if (error) {
        console.error("Insert appointment error:", error)
      }
    }

    // ==========================
    // 📝 NOTE LOCKED
    // ==========================
    if (body.Type === "Note Locked" && body.NoteId) {
      // Insert note record
      const { error: noteError } = await supabase
        .from("notes")
        .insert({
          clinic_id: clinic.id,
          intakeq_note_id: body.NoteId,
          intakeq_appointment_id: null,
          practitioner_name: null,
          locked_at: new Date().toISOString(),
        })

      if (noteError) {
        console.error("Note insert error:", noteError)
      }

      // Update incomplete appointments for that client
      const { error: updateError } = await supabase
        .from("appointments")
        .update({ note_completed: true })
        .eq("intakeq_client_id", body.ClientId?.toString())
        .eq("note_completed", false)

      if (updateError) {
        console.error("Update note completion error:", updateError)
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