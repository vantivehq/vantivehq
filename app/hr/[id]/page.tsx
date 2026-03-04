"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function StaffProfilePage() {
  const params = useParams()
  const id = params.id as string

  const [staff, setStaff] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchStaff = async () => {
      const { data } = await supabase
        .from("staff")
        .select("*")
        .eq("id", id)
        .single()

      if (data) setStaff(data)
    }

    fetchStaff()
  }, [id])

  const saveChanges = async () => {
    setSaving(true)

    const { error } = await supabase
      .from("staff")
      .update({
        role: staff.role,
        phone: staff.phone,
        email: staff.email,
        license_number: staff.license_number,
        license_expiration: staff.license_expiration,
      })
      .eq("id", id)

    setSaving(false)

    if (error) {
      alert("Failed to save")
      console.error(error)
    } else {
      alert("Saved")
    }
  }

  if (!staff) return <div>Loading...</div>

  return (
    <div className="space-y-8 max-w-3xl">

      <h1 className="text-3xl font-semibold">
        {staff.name}
      </h1>

      <div className="bg-white p-8 rounded-xl shadow-sm border space-y-6">

        <div>
          <label className="text-sm text-gray-500">
            Role
          </label>

          <input
            value={staff.role || ""}
            onChange={(e) =>
              setStaff({ ...staff, role: e.target.value })
            }
            className="w-full border rounded px-4 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">
            Phone
          </label>

          <input
            value={staff.phone || ""}
            onChange={(e) =>
              setStaff({ ...staff, phone: e.target.value })
            }
            className="w-full border rounded px-4 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">
            Email
          </label>

          <input
            value={staff.email || ""}
            onChange={(e) =>
              setStaff({ ...staff, email: e.target.value })
            }
            className="w-full border rounded px-4 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">
            License Number
          </label>

          <input
            value={staff.license_number || ""}
            onChange={(e) =>
              setStaff({
                ...staff,
                license_number: e.target.value,
              })
            }
            className="w-full border rounded px-4 py-2 mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">
            License Expiration
          </label>

          <input
            type="date"
            value={staff.license_expiration || ""}
            onChange={(e) =>
              setStaff({
                ...staff,
                license_expiration: e.target.value,
              })
            }
            className="w-full border rounded px-4 py-2 mt-1"
          />
        </div>

        <button
          onClick={saveChanges}
          className="bg-[#6B8E6B] text-white px-6 py-2 rounded-lg shadow hover:opacity-90"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>

    </div>
  )
}