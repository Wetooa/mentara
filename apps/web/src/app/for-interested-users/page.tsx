export default function ForInterestedUsersPage() {
  return (
    <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto space-y-8">
        <section className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-mentara-deep text-center">Find the Perfect Therapist for You</h1>
            <p className="text-mentara-deep/70 text-center max-w-2xl mx-auto">
                Our therapist discovery tool uses intelligent matching to help you find a professional who understands your needs.
            </p>
        </section>

        <div className="glass-card bg-white/50 p-6 flex flex-col md:flex-row gap-4 items-center mb-12 border-white/60 shadow-lg">
            <div className="flex-1 w-full relative group">
                <input 
                    type="text" 
                    placeholder="Search by specialty, name, or location..." 
                    className="w-full bg-white/60 border border-mentara-primary/20 rounded-full px-6 py-4 text-mentara-deep font-medium focus:outline-none focus:ring-2 focus:ring-mentara-primary/40 transition-all shadow-inner"
                />
            </div>
            <button className="bg-mentara-deep text-white px-10 py-4 rounded-full font-bold hover:bg-mentara-primary transition-all w-full md:w-auto shadow-xl hover:scale-105 active:scale-95">
                Search
            </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder Therapist Cards */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card bg-white/30 overflow-hidden group hover:translate-y-[-8px] transition-all duration-500 border-white/40 hover:shadow-2xl">
                    <div className="h-48 bg-mentara-accent/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
                        <div className="absolute bottom-4 left-6">
                            <span className="bg-white/80 backdrop-blur-sm text-mentara-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">Verified</span>
                        </div>
                    </div>
                    <div className="p-8 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-mentara-deep group-hover:text-mentara-primary transition-colors">Counselor {i}</h3>
                            <p className="text-sm text-mentara-primary font-bold">Anxiety & Depression Specialist</p>
                        </div>
                        <p className="text-base text-mentara-deep font-medium opacity-70 line-clamp-2">
                            Dedicated professional with over 10 years of experience in cognitive behavioral therapy and holistic healing...
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-mentara-deep/5">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-mentara-primary rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold text-mentara-deep/60 tracking-wider">AVAILABLE NOW</span>
                            </div>
                            <button className="text-sm font-bold text-mentara-deep hover:text-mentara-primary transition-colors flex items-center group/btn">
                                View Profile 
                                <span className="ml-1 group-hover/btn:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
