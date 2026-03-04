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
      <body className="bg-[#F6F1E8] text-[#2E2A26]">

        <div className="min-h-screen flex">

          {/* Sidebar */}
          <aside className="w-64 bg-white shadow-md p-6 flex flex-col justify-between">

            <div>
              <h1 className="text-xl font-semibold mb-8 tracking-wide">
                Vantive
              </h1>

              <nav className="space-y-4">

                <Link
                  href="/dashboard"
                  className="block px-4 py-2 rounded-lg hover:bg-[#EDE6DA] transition"
                >
                  Control Center
                </Link>

                <Link
                  href="/notes"
                  className="block px-4 py-2 rounded-lg hover:bg-[#EDE6DA] transition"
                >
                  Notes Oversight
                </Link>

              </nav>
            </div>

            <div className="text-xs text-gray-400">
              Elevate Health & Wellness
            </div>

          </aside>

          {/* Main Content */}
          <main className="flex-1 p-10">
            {children}
          </main>

        </div>

      </body>
    </html>
  )
}