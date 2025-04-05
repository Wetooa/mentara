import React from "react";
import { Input } from "../ui/input";

export default function SignUp() {
  return (
    <>
      <div className="mb-8 text-center">
        <p className="text-lg text-center text-secondary">
          You&apos;ve completed the pre-assessment!
        </p>
      </div>
      <div className="w-full space-y-4">
        <Input placeholder="First name or (nickname)" />

        <label className="text-[9px] w-full text-center text-black/60">
          For added privacy you can provide nickname instead of your first name
        </label>

        <Input placeholder="Email" />

        <Input placeholder="Confirm Email" />

        <Input placeholder="Password" />

        <Input placeholder="Confirm Password" />
      </div>
    </>
  );
}
