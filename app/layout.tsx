import "./globals.css"
import Link from "next/link"

export const metadata = {
  title: "Vantive",
  description: "Clinic Operations Platform",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-[#F6F1E8] via-[#EFE6D8] to-[#E8DCCA] text-[#2E2A26]">

        <div className="min-h-screen flex">

          {/* Sidebar */}
          <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-[#E2D6C5] shadow-lg p-6 flex flex-col justify-between">

            <div>
              <div className="flex items-center gap-2 mb-10">
                <div className="w-3 h-8 bg-[#6B8E6B] rounded-full" />
                <h1 className="text-xl font-semibold tracking-wide">
                  Vantive
                </h1>
              </div>

              <nav className="space-y-3">

                <Link
                  href="/dashboard"
                  className="block px-4 py-2 rounded-lg hover:bg-[#EDE3D3] transition font-medium"
                >
                  Control Center
                </Link>

                <Link
                  href="/notes"
                  className="block px-4 py-2 rounded-lg hover:bg-[#EDE3D3] transition font-medium"
                >
                  Notes Oversight
                </Link>

              </nav>
            </div>

            <div className="text-xs text-[#9C8F7A]">
              Elevate Health & Wellness
            </div>

          </aside>

          {/* Main Content */}
          <main className="flex-1 p-12">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-[#E5D9C7] p-10 min-h-[80vh]">
              {children}
            </div>
          </main>

        </div>

      </body>
    </html>
  )
}