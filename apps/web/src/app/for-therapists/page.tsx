export default function ForTherapistsPage() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto space-y-16">
        <section className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-mentara-deep">For Mental Health Professionals</h1>
            <p className="text-xl text-mentara-deep/80 max-w-3xl mx-auto">
                Mentara empowers therapists with the tools they need to reach more clients and manage their practice seamlessly.
            </p>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-8 space-y-4">
                <h2 className="text-2xl font-bold text-mentara-primary">Advanced Practice Tools</h2>
                <p className="text-mentara-deep/70">
                    From automated scheduling to integrated billing, we handle the logistics so you can focus on what matters most: your clients.
                </p>
            </div>
            <div className="glass-card p-8 space-y-4">
                <h2 className="text-2xl font-bold text-mentara-primary">Smart Matching</h2>
                <p className="text-mentara-deep/70">
                    Our AI-driven matching algorithm connects you with clients who best fit your specialization and therapeutic style.
                </p>
            </div>
            <div className="glass-card p-8 space-y-4">
                <h2 className="text-2xl font-bold text-mentara-primary">Secure Telehealth</h2>
                <p className="text-mentara-deep/70">
                    Conduct high-quality, encrypted video sessions directly through the Mentara platform.
                </p>
            </div>
            <div className="glass-card p-8 space-y-4">
                <h2 className="text-2xl font-bold text-mentara-primary">Growth & Community</h2>
                <p className="text-mentara-deep/70">
                    Access peer support, professional development resources, and a growing network of colleagues.
                </p>
            </div>
        </div>

        <section className="glass-card p-12 bg-mentara-deep text-white text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold">Ready to take your practice to the next level?</h2>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                Join hundreds of therapists who are already making a greater impact with Mentara.
            </p>
            <button className="bg-mentara-accent text-mentara-deep px-10 py-4 rounded-full font-bold text-lg hover:bg-mentara-surface transition-all shadow-lg hover:scale-105">
                Apply to Join Mentara
            </button>
        </section>
    </div>
  );
}
