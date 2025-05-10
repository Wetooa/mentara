import Logo from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function MainPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-tertiary/80 to-white">
      <section className="py-20 flex items-center justify-center min-h-screen">
        <div className="container px-4 mx-auto">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-4xl mx-auto p-10 text-center">
            <h1 className="text-4xl md:text-5xl font-semibold text-secondary leading-tight mb-6">
              Welcome to <Logo />
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Your journey to wellness begins here. Explore our services and
              connect with experts who understand your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/landing"
                className={cn(
                  buttonVariants(),
                  "bg-tertiary hover:bg-tertiary/90 text-primary font-bold px-8 py-3 rounded-lg text-lg shadow-md transition-all"
                )}
              >
                Explore Our Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
