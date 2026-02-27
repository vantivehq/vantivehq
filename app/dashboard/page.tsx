import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Dashboard() {
  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("*")
    .order("scheduled_start", { ascending: false })

  const now = new Date()

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Vantive Dashboard</h1>

      {error && (
        <p className="text-red-500">Error loading appointments</p>
      )}

      <div className="space-y-4">
        {appointments?.map((appt) => {
          const scheduled = new Date(appt.scheduled_start)
          const isOverdue =
            !appt.note_completed && scheduled < now

          return (
            <div
              key={appt.id}
              className={`p-4 border rounded-lg ${
                isOverdue
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">
                    {appt.practitioner_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {scheduled.toLocaleString()}
                  </p>
                </div>

                <div>
                  {appt.note_completed ? (
                    <span className="text-green-600 font-semibold">
                      Completed
                    </span>
                  ) : isOverdue ? (
                    <span className="text-red-600 font-semibold">
                      Overdue
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-semibold">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}