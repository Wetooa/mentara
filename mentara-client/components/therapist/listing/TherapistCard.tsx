import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhoneCall, MessageSquare, Calendar } from "lucide-react";
import { TherapistData } from "@/data/mockTherapistListingData";
import { Badge } from "@/components/ui/badge";

interface TherapistCardProps {
  therapist: TherapistData;
}

export default function TherapistCard({ therapist }: TherapistCardProps) {
  const nextAvailableTime = therapist.availableTimes[0];

  return (
    <Card className="w-full overflow-hidden shadow-sm">
      <CardContent className="p-0">
        <div className="p-4 flex flex-col h-full">
          {/* Status and Name Section */}
          <div className="flex items-center mb-3 justify-between">
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-1.5 ${therapist.isActive ? "bg-green-500" : "bg-gray-400"}`}
              ></div>
              <span className="text-xs text-muted-foreground">
                {therapist.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              ${therapist.sessionPrice} / {therapist.sessionDuration} min
            </div>
          </div>

          {/* Therapist Info */}
          <div className="flex flex-col">
            <h3 className="font-bold text-lg">{therapist.name}</h3>
            <p className="text-sm font-medium mb-2">{therapist.title}</p>

            {/* Specialties */}
            <div className="flex flex-wrap gap-1 mb-3">
              {therapist.specialties.map((specialty, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>

            {/* Available Time */}
            {nextAvailableTime && (
              <div className="flex items-center text-xs text-muted-foreground gap-2 my-1">
                <Calendar size={14} />
                <span>
                  {nextAvailableTime.day}, {nextAvailableTime.time}
                </span>
              </div>
            )}

            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
              {therapist.bio}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-auto">
              <Button variant="outline" className="flex-1 gap-2">
                <PhoneCall size={16} />
                Book a call
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <MessageSquare size={16} />
                Message
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
