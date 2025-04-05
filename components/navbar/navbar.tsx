import Logo from "../logo";
import NavbarButton from "./navbar-button";

export default function Navbar() {
  return (
    <nav className="sticky w-full flex justify-between py-2 px-4 shadow-lg items-center">
      <Logo />

      <ul className="text-xs">
        <NavbarButton content="About" redirect="/about" />
        <NavbarButton content="Community" redirect="/community" />
        <NavbarButton content="Treatment" redirect="/treatment" />
        <NavbarButton content="For Therapists" redirect="/for-therapists" />

        <NavbarButton content="Log In" redirect="/login" />
      </ul>
    </nav>
  );
}
