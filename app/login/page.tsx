"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {

 const router = useRouter()

 const [email, setEmail] = useState("")
 const [password, setPassword] = useState("")
 const [loading, setLoading] = useState(false)

 const signIn = async () => {

  setLoading(true)

  const { error } = await supabase.auth.signInWithPassword({
   email,
   password
  })

  setLoading(false)

  if (!error) {
   router.push("/")
  } else {
   alert("Invalid login")
  }

 }

 return (

  <div className="flex items-center justify-center min-h-screen bg-gray-50">

   <div className="bg-white p-10 rounded-xl shadow space-y-6 w-[420px]">

    <h1 className="text-2xl font-semibold">
     Vantive Login
    </h1>

    <input
     placeholder="Email"
     value={email}
     onChange={(e) => setEmail(e.target.value)}
     className="w-full border px-4 py-2 rounded"
    />

    <input
     type="password"
     placeholder="Password"
     value={password}
     onChange={(e) => setPassword(e.target.value)}
     className="w-full border px-4 py-2 rounded"
    />

    <button
     onClick={signIn}
     className="bg-[#6B8E6B] text-white w-full py-2 rounded"
    >
     {loading ? "Signing In..." : "Login"}
    </button>

   </div>

  </div>

 )
}