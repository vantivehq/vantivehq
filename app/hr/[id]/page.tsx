"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const documentTypes = [
  "RN License",
  "Driver License",
  "CPR Certification",
  "Malpractice Insurance",
  "Background Check",
]

export default function StaffProfilePage() {
  const params = useParams()
  const id = params.id as string

  const [staff, setStaff] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchStaff()
    fetchDocuments()
  }, [id])

  const fetchStaff = async () => {
    const { data } = await supabase
      .from("staff")
      .select("*")
      .eq("id", id)
      .single()

    if (data) setStaff(data)
  }

  const fetchDocuments = async () => {
    const { data } = await supabase
      .from("staff_documents")
      .select("*")
      .eq("staff_id", id)

    if (data) setDocuments(data)
  }

  const saveChanges = async () => {
    setSaving(true)

    await supabase
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
    alert("Saved")
  }

  const uploadDocument = async (
    file: File,
    type: string
  ) => {
    const filePath = `${id}/${type}-${Date.now()}`

    const { error: uploadError } = await supabase.storage
      .from("staff-documents")
      .upload(filePath, file)

    if (uploadError) {
      alert("Upload failed")
      return
    }

    const { data } = supabase.storage
      .from("staff-documents")
      .getPublicUrl(filePath)

    await supabase.from("staff_documents").insert({
      staff_id: id,
      document_type: type,
      file_url: data.publicUrl,
    })

    fetchDocuments()
  }

  if (!staff) return <div>Loading...</div>

  return (
    <div className="space-y-10 max-w-4xl">

      <h1 className="text-3xl font-semibold">
        {staff.name}
      </h1>

      {/* PROFILE INFO */}

      <div className="bg-white p-8 rounded-xl shadow-sm border space-y-6">

        <input
          value={staff.role || ""}
          placeholder="Role"
          onChange={(e) =>
            setStaff({ ...staff, role: e.target.value })
          }
          className="w-full border rounded px-4 py-2"
        />

        <input
          value={staff.phone || ""}
          placeholder="Phone"
          onChange={(e) =>
            setStaff({ ...staff, phone: e.target.value })
          }
          className="w-full border rounded px-4 py-2"
        />

        <input
          value={staff.email || ""}
          placeholder="Email"
          onChange={(e) =>
            setStaff({ ...staff, email: e.target.value })
          }
          className="w-full border rounded px-4 py-2"
        />

        <input
          value={staff.license_number || ""}
          placeholder="License Number"
          onChange={(e) =>
            setStaff({
              ...staff,
              license_number: e.target.value,
            })
          }
          className="w-full border rounded px-4 py-2"
        />

        <input
          type="date"
          value={staff.license_expiration || ""}
          onChange={(e) =>
            setStaff({
              ...staff,
              license_expiration: e.target.value,
            })
          }
          className="w-full border rounded px-4 py-2"
        />

        <button
          onClick={saveChanges}
          className="bg-[#6B8E6B] text-white px-6 py-2 rounded-lg shadow"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>

      {/* DOCUMENTS */}

      <div className="bg-white p-8 rounded-xl shadow-sm border space-y-6">

        <h2 className="text-xl font-semibold">
          Documents
        </h2>

        {documentTypes.map((type) => {
          const doc = documents.find(
            (d) => d.document_type === type
          )

          return (
            <div
              key={type}
              className="flex items-center justify-between border-b pb-3"
            >
              <div>
                <p className="font-medium">{type}</p>

                {doc && (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    className="text-sm text-blue-600"
                  >
                    View Document
                  </a>
                )}
              </div>

           <label className="cursor-pointer bg-[#6B8E6B] text-white px-4 py-2 rounded-lg shadow hover:opacity-90">
  Upload
  <input
    type="file"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files?.[0]
      if (file) uploadDocument(file, type)
    }}
  />
</label>
            </div>
          )
        })}
      </div>
    </div>
  )
}