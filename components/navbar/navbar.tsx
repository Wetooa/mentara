import Logo from "../logo";
import NavbarButton from "./navbar-button";

export default function Navbar() {
  return (
    <nav className="sticky w-full flex justify-between py-2 px-4 shadow-lg items-center">
      <Logo />

      <ul className="text-xs">
        {[
          { content: "About", redirect: "/about" },
          { content: "Community", redirect: "/community" },
          { content: "Treatment", redirect: "/treatment" },
          // { content: "For Therapists", redirect: "/for-therapists" },
          { content: "Therapist Application", redirect: "/therapist_signup" },
          { content: "Log In", redirect: "/sign-in" },
        ].map((link, index) => (
          <NavbarButton
            key={index}
            content={link.content}
            redirect={link.redirect}
          />
        ))}
      </ul>
    </nav>
  );
}
