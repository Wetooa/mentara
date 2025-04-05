"use client";

import { useEffect, useState } from "react";
import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTableColumns, faUser } from "@fortawesome/free-solid-svg-icons";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CoSidebar({ setShowTherapistApplication }: any) {
  return (
    <Collapsible defaultOpen className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger
            className="flex items-center  gap-2 text-2xl font-semibold text-gray-800 border-b-2 border-gray-300 "
            onClick={() => setShowTherapistApplication(false)}
          >
            <FontAwesomeIcon icon={faTableColumns} className="w-5 h-5" />
            <p className="text-base">Help</p>
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>

        <CollapsibleContent>
          <SidebarGroupContent>
            <p
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowTherapistApplication((prev: any) => !prev)} // Toggle Therapist Table visibility
            >
              <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
              Therapist Application
            </p>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export function TherapistTable() {
  //   const [therapists, setTherapists] = useState([]);
  //   const [selectedTherapist, setSelectedTherapist] = useState(null);

  //   useEffect(() => {
  //     const fetchTherapists = async () => {
  //       const res = await fetch("/api/therapists");
  //       const data = await res.json();
  //       setTherapists(data);
  //     };

  //     fetchTherapists();
  //   }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Profile</TableHead>
          <TableHead>Last Name</TableHead>
          <TableHead>First Name</TableHead>
          <TableHead>Submission Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Therapist Application Summary</DialogTitle>
                  <DialogDescription>
                    <div className="space-y-2">
                      <p>
                        <span className="font-semibold">Last Name:</span> Cruz
                      </p>
                      <p>
                        <span className="font-semibold">First Name:</span> Juan
                      </p>
                      <p>
                        <span className="font-semibold">Submission Date:</span>{" "}
                        March 10, 2025
                      </p>
                      <p>
                        <span className="font-semibold">
                          Uploaded Documents:
                        </span>{" "}
                        Resume.pdf, License.png
                      </p>
                      <p>
                        <span className="font-semibold">Additional Notes:</span>{" "}
                        Willing to work remotely.
                      </p>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </TableCell>
          <TableCell>Last Name Query</TableCell>
          <TableCell>First Name Query</TableCell>
          <TableCell>Submission Date timestamp query</TableCell>
          <TableCell>Approved</TableCell>
          <TableCell>
            <select
              defaultValue=""
              className={`border px-2 py-1 rounded font-semibold bg-white text-gray-700 focus:bg-white focus:outline-none`}
              onChange={(e) => {
                const selected = e.target.value;

                let baseClass =
                  "border px-2 py-1 rounded font-semibold focus:bg-white focus:outline-none";

                if (selected === "approved") {
                  e.target.className =
                    baseClass + " bg-green-600 text-white hover:bg-green-600  ";
                } else if (selected === "rejected") {
                  e.target.className =
                    baseClass +
                    " bg-red-600 text-white hover:bg-red-600 hover:text-white";
                } else {
                  e.target.className =
                    baseClass +
                    " bg-white text-gray-700 hover:bg-green-600 hover:text-white";
                }
              }}
            >
              <option value="" disabled>
                Select
              </option>
              <option
                value="approved"
                className="hover:bg-green-600 hover:text-white"
              >
                Approve
              </option>
              <option
                value="rejected"
                className="hover:bg-red-600 hover:text-white"
              >
                Reject
              </option>
            </select>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export default function AdminPage() {
  const [showTherapistApplication, setShowTherapistApplication] =
    useState(false);

  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r">
        <CoSidebar setShowTherapistApplication={setShowTherapistApplication} />
      </div>

      <div className="w-3/4 p-4">
        {showTherapistApplication && (
          <>
            <h1 className="text-2xl font-bold">Therapist Application</h1>
            <TherapistTable />
          </>
        )}
      </div>
    </div>
  );
}
