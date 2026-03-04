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

  if (!staff) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8 max-w-3xl">

      <h1 className="text-3xl font-semibold">
        {staff.name}
      </h1>

      <div className="bg-white p-8 rounded-xl shadow-sm border space-y-6">

        <div>
          <label className="text-sm text-gray-500">Role</label>
          <p className="text-lg">{staff.role}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Phone</label>
          <p className="text-lg">{staff.phone || "Not set"}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Email</label>
          <p className="text-lg">{staff.email || "Not set"}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">License Number</label>
          <p className="text-lg">{staff.license_number || "Not set"}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">License Expiration</label>
          <p className="text-lg">
            {staff.license_expiration || "Not set"}
          </p>
        </div>

      </div>

    </div>
  )
}