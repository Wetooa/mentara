import Logo from "@/components/Logo";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky w-full flex justify-between py-2 px-4 shadow-lg items-center">
      <div>
        <Logo />
      </div>

      <ul className="text-xs">
        {[
          { content: "About", redirect: "/about" },
          { content: "Community", redirect: "/community" },
          { content: "Treatment", redirect: "/pre-assessment" },
          {
            content: "Therapist Application",
            redirect: "/therapist-application",
          },
          { content: "Log In", redirect: "/sign-in" },
        ].map(({ content, redirect }, index) => (
          <Link
            key={index}
            href={redirect}
            className={buttonVariants({ variant: "link" })}
          >
            {content}
          </Link>
        ))}
      </ul>
    </nav>
  );
}
