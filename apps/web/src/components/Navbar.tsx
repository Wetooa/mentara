import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <div className="glass-card bg-mentara-surface/65 backdrop-blur-mentara border border-mentara-surface/40 shadow-mentara-glass px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-mentara-deep tracking-tight">Mentara</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="/about" className="text-mentara-deep font-medium hover:text-mentara-primary transition-colors">
            About
          </Link>
          <Link href="/for-therapists" className="text-mentara-deep font-medium hover:text-mentara-primary transition-colors">
            For Therapists
          </Link>
          <Link href="/find-a-therapist" className="text-mentara-deep font-medium hover:text-mentara-primary transition-colors">
            Find a therapist
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-mentara-deep font-medium px-4 py-2 hover:bg-mentara-surface/40 rounded-full transition-all">
            Log in
          </Link>
          <Link href="/signup" className="bg-mentara-primary text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-mentara-deep transition-all transform hover:scale-105">
            Join Mentara
          </Link>
        </div>
      </div>
    </nav>
  );
}
