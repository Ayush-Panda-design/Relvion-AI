import { getSession } from '@/lib/auth/getSession';
import Link from 'next/link';

export default async function LandingPage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-[#FFF9C4] text-red-900 font-sans overflow-x-hidden flex flex-col relative">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#FFEE58]/40 blur-3xl animate-pulse" />
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#FBC02D]/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] rounded-full bg-[#D32F2F]/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-[#D32F2F] drop-shadow-lg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight">Relvion AI</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="#features" className="text-sm font-semibold text-green-800 hover:text-red-700 transition-colors">Features</Link>
          <Link href="#how-it-works" className="text-sm font-semibold text-green-800 hover:text-red-700 transition-colors">How it Works</Link>
          
          {session ? (
            <Link 
              href="/dashboard"
              className="px-6 py-2 bg-[#D32F2F] hover:bg-[#C62828] text-[#FFF9C4] rounded-full font-semibold transition-all shadow-[0_0_15px_rgba(201,168,76,0.4)] hover:shadow-[0_0_25px_rgba(201,168,76,0.6)]"
            >
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-4 ml-4">
              <Link href="/signin" className="text-sm font-semibold text-red-800 hover:text-[#D32F2F] transition-colors">
                Sign In
              </Link>
              <Link 
                href="/signin"
                className="px-6 py-2 bg-[#D32F2F] hover:bg-[#C62828] text-[#FFF9C4] rounded-full font-semibold transition-all shadow-[0_0_15px_rgba(201,168,76,0.4)] hover:shadow-[0_0_25px_rgba(201,168,76,0.6)]"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10 flex items-center justify-center pt-10 pb-20">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFEE58] border border-[#FBC02D] text-red-800 text-sm font-semibold mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#22c55e]"></span>
            Now open for early access
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-900 via-red-700 to-[#D32F2F]">
            The intelligent email <br /> client you deserve.
          </h1>
          
          <p className="text-lg md:text-xl text-green-900 max-w-2xl mb-12 font-medium leading-relaxed">
            Experience a Superhuman-style inbox supercharged with a dedicated AI assistant. Manage emails, schedule events, and command your workflow with natural language.
          </p>

          {session ? (
            <Link 
              href="/dashboard"
              className="group relative px-8 py-4 bg-[#D32F2F] text-[#FFF9C4] rounded-2xl font-bold text-lg transition-all hover:bg-[#C62828] shadow-[0_0_30px_rgba(211,47,47,0.4)] hover:shadow-[0_0_40px_rgba(211,47,47,0.6)] overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Go to your Dashboard 
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </span>
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link 
                href="/signin"
                className="px-8 py-4 bg-[#D32F2F] text-[#FFF9C4] rounded-2xl font-bold text-lg transition-all hover:bg-[#C62828] shadow-[0_0_30px_rgba(211,47,47,0.4)] hover:shadow-[0_0_40px_rgba(211,47,47,0.6)]"
              >
                Sign In with Google
              </Link>
            </div>
          )}

          {/* Product Preview Mockup */}
          <div className="mt-20 relative w-full max-w-4xl rounded-xl border border-[#FBC02D] bg-[#FFFDE7] shadow-[0_30px_100px_rgba(251,192,45,0.4)] overflow-hidden">
            <div className="h-8 bg-[#FFEE58] border-b border-[#FBC02D] flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="p-4 flex gap-4 h-[400px]">
              <div className="w-1/4 bg-[#FFF59D] rounded-lg border border-[#FBC02D] p-3 space-y-3">
                <div className="h-8 bg-[#FFEE58] rounded mb-6"></div>
                <div className="h-4 bg-[#FFEE58] rounded w-3/4"></div>
                <div className="h-4 bg-[#FFEE58] rounded w-1/2"></div>
                <div className="h-4 bg-[#FFEE58] rounded w-2/3"></div>
              </div>
              <div className="flex-1 bg-[#FFF59D] rounded-lg border border-[#FBC02D] p-4 flex flex-col gap-3">
                <div className="h-10 bg-[#FFEE58] rounded-lg w-full mb-4"></div>
                <div className="flex-1 bg-[#FFEE58] rounded-lg w-full"></div>
                <div className="flex-1 bg-[#FFEE58] rounded-lg w-full"></div>
                <div className="flex-1 bg-[#FFEE58] rounded-lg w-full"></div>
              </div>
              <div className="w-1/4 bg-[#FFF59D] rounded-lg border border-[#FBC02D] p-3 flex flex-col justify-end">
                <div className="h-12 bg-[#FFEE58] rounded-lg w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
