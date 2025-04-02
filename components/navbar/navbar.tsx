import Image from "next/image";
import NavbarButton from "./navbar-button";

export default function Navbar() {
  return (
    <nav className="sticky w-full flex justify-between py-2 px-4 shadow-lg items-center">
      <div className="flex items-center gap-2">
        <Image
          width={50}
          height={25}
          src={"/mentara-icon.png"}
          alt={"Mentara Icon"}
        />
        <h1 className="font-bold text-3xl leading-none -mt-1 text-primary ">
          mentara
        </h1>
      </div>

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
