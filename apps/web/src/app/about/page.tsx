export default function AboutPage() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto space-y-12">
        <section className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-mentara-deep">About Mentara</h1>
            <p className="text-xl text-mentara-deep font-medium leading-relaxed opacity-90">
                Mentara is more than just a platform; it's a commitment to mental well-being in the modern age. 
                We believe that everyone deserves access to high-quality, personalized mental health support.
            </p>
        </section>

        <div className="glass-card bg-white/40 p-10 space-y-8 border-white/60">
            <h2 className="text-3xl font-bold text-mentara-deep">Our Mission</h2>
            <p className="text-lg text-mentara-deep font-medium opacity-80">
                To bridge the gap between those seeking help and the professionals who can provide it, using 
                technology as a catalyst for human connection and healing. We strive to create a space that 
                is transparent, supportive, and accessible to all.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 pt-6">
                <div className="space-y-2">
                    <h3 className="font-bold text-mentara-primary text-lg">Accessibility</h3>
                    <p className="text-sm text-mentara-deep font-medium opacity-70">Making mental health support available whenever and wherever you need it.</p>
                </div>
                <div className="space-y-2">
                    <h3 className="font-bold text-mentara-primary text-lg">Personalization</h3>
                    <p className="text-sm text-mentara-deep font-medium opacity-70">Using AI to ensure you find the therapist who truly understands your unique journey.</p>
                </div>
            </div>
        </div>

        <section className="space-y-6 text-center pt-12">
            <h2 className="text-3xl font-bold text-mentara-deep">Join our community</h2>
            <p className="text-mentara-deep/70 max-w-xl mx-auto">
                Whether you're looking for support or offering it, Mentara is the place for you.
            </p>
        </section>
    </div>
  );
}
