export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header Public */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">💈 Antrian Barbershop</h2>
            <a
              href="/"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Home
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm">
          © 2024 Antrian Barbershop. Multi-tenant SaaS. Powered by Next.js.
        </div>
      </footer>
    </div>
  );
}
