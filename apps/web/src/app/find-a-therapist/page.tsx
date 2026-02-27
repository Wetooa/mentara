export default function FindATherapistPage() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto space-y-8">
        <section className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-mentara-deep text-center">Find the Perfect Therapist for You</h1>
            <p className="text-mentara-deep/70 text-center max-w-2xl mx-auto">
                Our therapist discovery tool uses intelligent matching to help you find a professional who understands your needs.
            </p>
        </section>

        <div className="glass-card p-6 flex flex-col md:flex-row gap-4 items-center mb-12">
            <div className="flex-1 w-full">
                <input 
                    type="text" 
                    placeholder="Search by specialty, name, or location..." 
                    className="w-full bg-mentara-surface/40 border border-mentara-surface/60 rounded-full px-6 py-3 text-mentara-deep focus:outline-none focus:ring-2 focus:ring-mentara-primary/50 transition-all"
                />
            </div>
            <button className="bg-mentara-primary text-white px-8 py-3 rounded-full font-bold hover:bg-mentara-deep transition-all w-full md:w-auto shadow-md">
                Search
            </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder Therapist Cards */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card overflow-hidden group hover:translate-y-[-4px] transition-all duration-300">
                    <div className="h-40 bg-mentara-accent/20 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-mentara-surface/40 to-transparent" />
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-mentara-deep group-hover:text-mentara-primary transition-colors">Counselor {i}</h3>
                            <p className="text-sm text-mentara-primary font-medium">Anxiety & Depression Specialist</p>
                        </div>
                        <p className="text-sm text-mentara-deep/60 line-clamp-2">
                            Dedicated professional with over 10 years of experience in cognitive behavioral therapy...
                        </p>
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs font-bold text-mentara-deep/40 tracking-wider">AVAILABLE NOW</span>
                            <button className="text-sm font-bold text-mentara-deep hover:underline">View Profile &rarr;</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
