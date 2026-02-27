import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { filter?: string }
}) {
  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .order("scheduled_start", { ascending: false })

  const now = new Date()

  const enriched = appointments?.map((appt) => {
    const scheduled = new Date(appt.scheduled_start)
    const isOverdue =
      !appt.note_completed && scheduled < now

    return {
      ...appt,
      scheduled,
      isOverdue,
    }
  }) ?? []

  const filter = searchParams?.filter || "all"

  const filtered = enriched.filter((appt) => {
    if (filter === "overdue") return appt.isOverdue
    if (filter === "pending")
      return !appt.note_completed && !appt.isOverdue
    if (filter === "completed") return appt.note_completed
    return true
  })

  const total = enriched.length
  const overdueCount = enriched.filter((a) => a.isOverdue).length
  const completedCount = enriched.filter((a) => a.note_completed).length
  const completionRate =
    total > 0 ? Math.round((completedCount / total) * 100) : 0

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Vantive Dashboard
      </h1>

      {/* 📊 Stats Header */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatBox label="Total" value={total} />
        <StatBox label="Overdue" value={overdueCount} red />
        <StatBox label="Completed" value={completedCount} green />
        <StatBox label="Completion %" value={`${completionRate}%`} />
      </div>

      {/* 🔎 Filters */}
      <div className="flex gap-4 mb-6">
        <FilterButton label="All" value="all" active={filter === "all"} />
        <FilterButton label="Overdue" value="overdue" active={filter === "overdue"} />
        <FilterButton label="Pending" value="pending" active={filter === "pending"} />
        <FilterButton label="Completed" value="completed" active={filter === "completed"} />
      </div>

      {/* 📋 Appointment List */}
      <div className="space-y-4">
        {filtered.map((appt) => (
          <div
            key={appt.id}
            className={`p-4 border rounded-lg ${
              appt.isOverdue
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
                  {appt.scheduled.toLocaleString()}
                </p>
              </div>

              <div>
                {appt.note_completed ? (
                  <span className="text-green-600 font-semibold">
                    Completed
                  </span>
                ) : appt.isOverdue ? (
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
        ))}
      </div>
    </main>
  )
}

function StatBox({
  label,
  value,
  red,
  green,
}: {
  label: string
  value: any
  red?: boolean
  green?: boolean
}) {
  return (
    <div className="p-4 border rounded-lg bg-white">
      <p className="text-sm text-gray-500">{label}</p>
      <p
        className={`text-2xl font-bold ${
          red ? "text-red-600" : green ? "text-green-600" : ""
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function FilterButton({
  label,
  value,
  active,
}: {
  label: string
  value: string
  active: boolean
}) {
  return (
    <a
      href={`/dashboard?filter=${value}`}
      className={`px-4 py-2 rounded border ${
        active
          ? "bg-black text-white"
          : "bg-white text-black"
      }`}
    >
      {label}
    </a>
  )
}