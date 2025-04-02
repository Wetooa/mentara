import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

export default function LandingPage() {
  return (
    <div className="">
      <section className="bg-gradient-to-b from-tertiary to-transparent border-secondary border-b flex items-center justify-center h-screen">
        <div className="border shadow-lg bg-white flex w-full max-w-[1200px]">
          <div className="flex-1 flex flex-col justify-center gap-5">
            <h2 className="text-secondary text-5xl font-semibold leading-16">
              Safe Support. <br />
              Expert Help. <br />A Stronger You.
            </h2>
            <Button className="bg-tertiary text-primary font-bold w-fit">
              Get Started
            </Button>
          </div>
          <Image
            width={540}
            height={960}
            src={"/landing/woman-flower-crown.png"}
            alt={"Woman Flower Crown"}
          />
        </div>
      </section>

      <section>
        <h2>Breaking Barriers Together</h2>
      </section>
    </div>
  );
}
