import Image from "next/image";
import React from "react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        width={50}
        height={25}
        src={"/mentara-icon.png"}
        alt={"Mentara Icon"}
      />
      <h1 className="font-[Kollektif] font-bold text-3xl leading-none -mt-1 text-primary ">
        mentara
      </h1>
    </div>
  );
}
