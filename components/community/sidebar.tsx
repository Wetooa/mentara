import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dot } from "lucide-react";

export default function CommunitySidebar() {
  const items = {
    getStarted: {
      title: "Get Started",
      channels: [
        {
          title: "About the community",
        },
        {
          title: "Announcements",
        },
      ],
    },
    mentaraCommunity: {
      title: "Mentara Community",
      channels: [
        {
          title: "Mentara Community",
        },
        {
          title: "Reflections",
        },
        {
          title: "Mutual Zone",
        },
      ],
    },
    treatmentSpace: {
      title: "Treatment Space",
      channels: [
        {
          title: "Ask the struggle",
        },
        {
          title: "Progress Journal",
        },
        {
          title: "Mutual Zone",
        },
        {
          title: "Release Zoom",
        },
      ],
    },
  };

  return (
    <div className="w-60 p-2 bg-slate-50 h-full border border-slate-200">
      <h2>Community Channels and probably select here</h2>

      <Accordion type="multiple" className="w-full">
        {Object.entries(items).map(([key, category]) => (
          <AccordionItem key={key} value={key}>
            <AccordionTrigger className="font-bold bg-tertiary rounded-3xl px-4 py-1 no-underline ">
              {category.title}
            </AccordionTrigger>

            <AccordionContent>
              <div className="space-y-1 p-2">
                {category.channels.map((channel, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-center rounded-md hover:bg-slate-200 cursor-pointer text-slate-600 text-sm"
                  >
                    <Dot /> {channel.title}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
