import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react"; // assuming you're using Lucide icons
import { Button } from "@/components/ui/button";

export interface TherapistProps {
  photo: string;
  firstName: string;
  lastName: string;
  tags: string[];
  description: string;
}

export default function TherapistCard({
  photo,
  firstName,
  lastName,
  tags,
  description,
}: TherapistProps) {
  return (
    <div>
      <div className="relative">
        {/* Plus Button */}
        <Button
          size="icon"
          aria-label="Add"
          className="absolute top-2 right-2 z-20 bg-[#608128] text-white hover:bg-white hover:text-[#436B00] transition-colors"
        >
          <Plus className="w-10 h-10 stroke-[4]" />
        </Button>

        <Card className="relative overflow-hidden h-80">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${photo})` }}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />

          {/* Foreground content */}
          <CardContent className="px-2 relative z-20 flex flex-col items-center justify-end h-full text-white">
            <div className="w-56">
              <div className="flex gap-1 flex-wrap my-2 items-start">
                {tags.map((tag, i) => (
                  <div
                    key={tag}
                    className="border-2 border-[#436B00] bg-white flex justify-center items-center rounded-sm"
                  >
                    <span
                      key={i}
                      className="text-[#436B00] text-xs font-bold bg-opacity-20 px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1 g-opacity-80 text-white text-xs px-4 py-2 w-56 rounded-[10px] h-20 bg-[#564500]">
              <h2 className="text-base font-semibold  text-left">
                {firstName} {lastName}
              </h2>
              <div className="text-justify">{description}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
