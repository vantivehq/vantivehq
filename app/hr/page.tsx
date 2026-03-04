"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Staff = {
  id: string
  name: string
  role: string
  status: string
  license_expiration: string | null
}

export default function HRPage() {
  const [staff, setStaff] = useState<Staff[]>([])

  useEffect(() => {
    const fetchStaff = async () => {
      const { data } = await supabase
        .from("staff")
        .select("*")
        .order("created_at", { ascending: false })

      if (data) setStaff(data as Staff[])
    }

    fetchStaff()
  }, [])

  const today = new Date()

  return (
    <div className="space-y-8">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">HR Portal</h1>
        <Link
          href="/hr/new"
          className="bg-[#6B8E6B] text-white px-4 py-2 rounded-lg shadow hover:opacity-90"
        >
          + Add Staff
        </Link>
      </div>

      <div className="space-y-4">
        {staff.map((member) => {
          const expiration =
            member.license_expiration
              ? new Date(member.license_expiration)
              : null

          const isExpiring =
            expiration &&
            expiration.getTime() - today.getTime() <
              30 * 24 * 60 * 60 * 1000

          return (
            <Link
              key={member.id}
              href={`/hr/${member.id}`}
              className={`block bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition ${
                isExpiring
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">
                    {member.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {member.role}
                  </p>
                </div>

                <div className="text-sm">
                  {isExpiring
                    ? "License Expiring Soon"
                    : member.status}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

    </div>
  )
}