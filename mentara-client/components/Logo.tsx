import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Logo() {
  return (
    <Link href="/" className="w-full flex justify-center items-center gap-2">
      <Image
        width={50}
        height={25}
        src={"/icons/mentara/mentara-icon.png"}
        alt={"Mentara Icon"}
      />
      <h1 className="font-[Kollektif] font-bold text-3xl leading-none -mt-1 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        mentara
      </h1>
    </Link>
  );
}
