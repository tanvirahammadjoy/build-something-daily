export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>
      <footer className="text-center py-4 text-xs text-gray-400">
        BlogForge · Built with Next.js
      </footer>
    </div>
  )
}
