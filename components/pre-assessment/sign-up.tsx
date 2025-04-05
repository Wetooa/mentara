import React from "react";
import { Input } from "../ui/input";

export default function PreAssessmentSignUp() {
  return (
    <>
      <div className="mb-8 text-center">
        <p className="text-lg text-center text-secondary">
          You&apos;ve completed the pre-assessment!
        </p>
      </div>
      <div className="w-full space-y-4">
        <div className="w-full flex flex-col gap-2">
          <Input placeholder="First name or (nickname)" />
          <p className="text-[9px] w-full text-center text-black/60">
            For added privacy you can provide nickname instead of your first
            name
          </p>
        </div>

        <Input placeholder="Email" />
        <Input placeholder="Confirm Email" />
        <Input placeholder="Password" />
        <Input placeholder="Confirm Password" />
      </div>
    </>
  );
}
