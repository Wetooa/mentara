import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-32">
        {/* Hero Section */}
        <section className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-7xl font-bold text-mentara-deep leading-tight">
              Your Journey to <br />
              <span className="text-mentara-primary drop-shadow-sm">Mental Wellness</span> Starts Here
            </h1>
            <p className="text-lg md:text-xl text-mentara-deep font-medium max-w-2xl mx-auto opacity-90">
              Mentara provides a safe harbor for your mind. Connect with professional therapists
              and discover personalized tools for a healthier you.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link 
              href="/for-interested-users" 
              className="bg-mentara-deep text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-mentara-primary transition-all transform hover:scale-105 w-full md:w-auto text-center"
            >
              Interested in Mentara?
            </Link>
            <Link 
              href="/about" 
              className="glass-card bg-white/40 px-10 py-4 rounded-full font-bold text-lg text-mentara-deep border border-white/60 hover:bg-white/60 transition-all w-full md:w-auto text-center"
            >
              Learn More
            </Link>
          </div>

          <div className="relative h-64 md:h-96 w-full max-w-5xl mx-auto glass-card bg-white/20 overflow-hidden mt-12 group">
             <div className="absolute inset-0 bg-gradient-to-tr from-mentara-primary/10 to-mentara-accent/10 animate-pulse" />
             <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-2xl md:text-3xl font-mentara font-light text-mentara-deep italic opacity-70">"A safe space for transformation"</p>
             </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="about" className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 space-y-4 hover:translate-y-[-4px] transition-transform">
                <div className="w-12 h-12 bg-mentara-accent/30 rounded-2xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-mentara-deep" style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-mentara-deep">Safe & Secure</h3>
                <p className="text-mentara-deep/70">Your privacy is our priority. All sessions and data are protected with bank-grade encryption.</p>
            </div>

            <div className="glass-card p-8 space-y-4 hover:translate-y-[-4px] transition-transform">
                <div className="w-12 h-12 bg-mentara-primary/30 rounded-2xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-mentara-deep" style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-mentara-deep">Expert Therapists</h3>
                <p className="text-mentara-deep/70">Carefully vetted professionals ready to support you in every step of your journey.</p>
            </div>

            <div className="glass-card p-8 space-y-4 hover:translate-y-[-4px] transition-transform">
                <div className="w-12 h-12 bg-mentara-deep/30 rounded-2xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-mentara-deep" style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-mentara-deep">AI Personalization</h3>
                <p className="text-mentara-deep/70">Leverage smart tools to find the perfect therapist match for your unique needs.</p>
            </div>
        </section>

        {/* For Therapists Section */}
        <section id="for-therapists" className="glass-card p-12 bg-mentara-deep text-white">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h2 className="text-4xl font-bold">Grow Your Practice with Mentara</h2>
                    <p className="text-lg text-white/90">
                        Join our community of dedicated mental health professionals. We provide the platform, the tools, and the clients—you provide the care.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-center space-x-3">
                            <svg className="w-6 h-6 text-mentara-accent shrink-0" style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-white">Advanced Practice Management</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-6 h-6 text-mentara-accent shrink-0" style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-white">Flexible Scheduling</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <svg className="w-6 h-6 text-mentara-accent shrink-0" style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-white">Global Client Reach</span>
                        </li>
                    </ul>
                    <Link 
                        href="/for-therapists" 
                        className="inline-block bg-mentara-accent text-mentara-deep px-8 py-3 rounded-full font-bold hover:bg-mentara-surface transition-colors shadow-lg"
                    >
                        Join as a Therapist
                    </Link>
                </div>
                <div className="hidden md:block">
                    <div className="w-full h-80 rounded-mentara overflow-hidden bg-mentara-surface/10 backdrop-blur-sm border border-mentara-surface/20 flex items-center justify-center">
                         <span className="text-mentara-surface/40 text-sm">Empowering Mental Health Professionals</span>
                    </div>
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-16 text-mentara-deep/60 text-sm font-medium border-t border-mentara-deep/10">
            &copy; 2026 Mentara Ecosytem. All rights reserved. Built with love and care for mental wellness.
        </footer>
      </div>

      <button className="fixed bottom-8 right-8 bg-black text-white rounded-full px-8 py-4 font-bold shadow-2xl animate-pulse-mentara z-40 transition-transform hover:scale-110 active:scale-95">
        Need Help Now?
      </button>
    </div>
  );
}
