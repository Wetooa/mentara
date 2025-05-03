"use client";

import Logo from "@/components/logo";
import TherapistCard, {
  TherapistProps,
} from "@/components/recommended-therapists/therapist";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

const Therapists: TherapistProps[] = [
  {
    photo: "laine.jpg",
    firstName: "Jane",
    lastName: "Doe",
    tags: ["Anxiety", "CBT"],
    description: "Certified in trauma recovery and CBT.",
  },
  {
    photo: "laine.jpg",
    firstName: "John",
    lastName: "Smith",
    tags: ["Depression", "Mindfulness"],
    description: "Specialist in depression and mindfulness therapy.",
  },
  {
    photo: "laine.jpg",
    firstName: "Sara",
    lastName: "Lee",
    tags: ["Grief", "EMDR"],
    description: "Grief counselor using EMDR techniques.",
  },
  {
    photo: "laine.jpg",
    firstName: "Mike",
    lastName: "Brown",
    tags: ["Family", "Adolescents"],
    description: "Works with teens and family dynamics.",
  },
  {
    photo: "laine.jpg",
    firstName: "Mike",
    lastName: "Brown",
    tags: ["Family", "Adolescents"],
    description: "Works with teens and family dynamics.",
  },
];

const Navbar = () => (
  <nav className="bg-white text-white w-full sticky top-0 z-50 shadow-md">
    <div className="flex justify-center p-4">
      <Image
        width={50}
        height={50}
        alt="Mentara Logo"
        src="mentara-landscape.png"
        className="w-52 h-12"
      />
    </div>
  </nav>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2FFDD] via-white to-[#F2FFDD] flex flex-col gap-12 items-center">
      <Navbar />
      <div className="flex flex-col gap-2 w-full max-w-6xl p-2">
        <h1 className="text-3xl font-bold text-[#564500]">Welcome, User!</h1>
        <p className="text-xl text-neutral-600">
          You’ve taken a great first step. Let’s find the right therapist to
          support you from here. These are some personalized recommendations to
          get started.
        </p>
      </div>

      <Carousel opts={{ align: "start" }} className="w-full max-w-6xl mx-auto">
        <CarouselContent>
          {Therapists.map((therapist, index) => (
            <CarouselItem
              key={index}
              className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <div className="p-2">
                <TherapistCard {...therapist} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="w-full max-w-5xl border border-[#436B00] rounded-[10px] h-42 bg-white flex items-center">
        <div className="w-1/3 h-full flex justify-center pt-4">
          <Image
            src="/brain.png"
            width={100}
            height={100}
            className="max-h-full max-w-full object-contain"
            alt="brain"
          />
        </div>

        <div className="w-3/3 text-3xl flex justify-center">
          <div className="flex flex-col justify-center">
            <p>This is your safe space.</p>
            <p>Join the community that understands you.</p>
          </div>
        </div>
        <div className="w-1/3 flex justify-center">
          <div>
            <Button className="bg-[#608128] text-white hover:bg-white hover:text-[#436B00] transition-colors w-12 h-12 rounded-[50%]">
              <ArrowRight className="w-25 h-25 stroke-[4]" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
