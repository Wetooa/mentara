import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";

import PHILIPPINE_PROVINCES from "@/const/provinces";
import PROVIDER_TYPE from "@/const/provider";
import Image from "next/image";
import { Input } from "@/components/ui/input";

interface FormInputProps {
  PlaceHolder: string;
  ColumnStart: number;
  RowStart: number;
  Span: boolean;
}

interface DropdownProps {
  PlaceHolder: string;
  ColumnStart: number;
  RowStart: number;
  Span: boolean;
  List: string[];
}

export default function TherapistSignUp() {
  return (
    <div className="w-full h-full flex flex-col gap-36 bg-gradient-to-b from-tertiary to-transparent">
      <div className="w-full flex items-center justify-center bg-white h-28 drop-shadow-2xl">
        <Image
          src="/mentara-landscape.png"
          width={320}
          height={500}
          alt="mentara landscape logo"
        ></Image>
      </div>
      <div className="h-full justify-center items-center flex gap-12 flex-col  border-secondary">
        <div className="flex flex-col gap-2 items-center justify-center">
          <span className="text-4xl text-secondary">
            Join Our Community of Compassionate Therapists
          </span>
          <span className="text-md text-secondary">
            Tell us a bit about yourself, and we'll guide you through the next
            steps to connect with those who need your support.
          </span>
        </div>
        <section className="w-1/2 h-1/2 bg-card p-12 drop-shadow-2xl flex flex-col gap-6 rounded-2xl">
          <span className="text-lg text-secondary font-bold">
            Your information
          </span>

          <div className="w-full h-fit grid gap-6 grid-cols-2 grid-rows-4">
            <FormInput
              PlaceHolder="FirstName"
              ColumnStart={1}
              RowStart={1}
              Span={false}
            ></FormInput>
            <FormInput
              PlaceHolder="FirstName"
              ColumnStart={2}
              RowStart={1}
              Span={false}
            ></FormInput>
            <FormInput
              PlaceHolder="Mobile Phone Number"
              ColumnStart={1}
              RowStart={2}
              Span={true}
            ></FormInput>
            <FormInput
              PlaceHolder="Email"
              ColumnStart={1}
              RowStart={3}
              Span={true}
            ></FormInput>

            <FormDropdown
              PlaceHolder="Province"
              ColumnStart={1}
              RowStart={4}
              Span={false}
              List={PHILIPPINE_PROVINCES}
            ></FormDropdown>

            <FormDropdown
              PlaceHolder="Provider Type"
              ColumnStart={2}
              RowStart={4}
              Span={false}
              List={PROVIDER_TYPE}
            ></FormDropdown>
          </div>

          <button className="w-1/3 justify-self-center h-12 bg-secondary text-white drop-shadow-2xl rounded-full self-center">
            Submit
          </button>
        </section>
      </div>
    </div>
  );
}

function FormInput(props: FormInputProps) {
  return (
    <Input
      className={`w-full h-full text-md data-[placeholder]:text-white-background border-0 bg-input rounded-4xl p-6 col-start-${
        props.ColumnStart
      } row-start-${props.RowStart} ${props.Span ? "col-span-2" : ""}`}
      placeholder={props.PlaceHolder}
    ></Input>
  );
}

function FormDropdown(props: DropdownProps) {
  return (
    <Select>
      <SelectTrigger
        className={`w-full h-full text-md data-[placeholder]:text-white-background border-0 bg-input rounded-4xl p-6 col-start-${
          props.ColumnStart
        } row-start-${props.RowStart} ${props.Span ? "col-span-2" : ""}`}
      >
        <SelectValue placeholder={props.PlaceHolder} />
      </SelectTrigger>
      <SelectContent className="rounded-2xl">
        <SelectGroup>
          {props.List.map((province, index) => (
            <SelectItem
              className="text-white-background data-[highlighted]:bg-primary data-[highlighted]:text-white"
              key={index}
              value={"" + index}
            >
              {province}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
