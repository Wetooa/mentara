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
      <h1 className="font-[Kollektif] font-bold text-3xl leading-none -mt-1 text-primary ">
        mentara
      </h1>
    </Link>
  );
}
