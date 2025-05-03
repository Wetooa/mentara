"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { faTableColumns, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChevronDown } from "lucide-react";

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
            <p className="text-base">Therapist</p>
            <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>

        <CollapsibleContent>
          <SidebarGroupContent>
            <p
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowTherapistApplication(true)}
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

  const [selectedValue, setSelectedValue] = useState<string>("");

  const triggerClasses =
    selectedValue === "approved"
      ? "bg-lime-600 text-white"
      : selectedValue === "rejected"
        ? "bg-red-600 text-white"
        : "bg-gray-100 text-white";

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
          <TableCell>
            {selectedValue === "approved" ? (
              <p className="text-green-600 font-medium">Approved</p>
            ) : selectedValue === "rejected" ? (
              <p className="text-red-600 font-medium">Rejected</p>
            ) : (
              <p className="text-yellow-600 font-medium">Pending</p>
            )}
          </TableCell>
          <TableCell>
            <Select value={selectedValue} onValueChange={setSelectedValue}>
              <SelectTrigger
                className={`w-[180px] ${triggerClasses} [&_svg]:hidden`}
              >
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    value="approved"
                    className="hover:bg-lime-600 hover:text-white focus:bg-lime-600 focus:text-white data-[state=checked]:bg-lime-600 data-[state=checked]:text-white"
                  >
                    Approve
                  </SelectItem>
                  <SelectItem
                    value="rejected"
                    className="hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white data-[state=checked]:bg-red-600 data-[state=checked]:text-white"
                  >
                    Reject
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
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
