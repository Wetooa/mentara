import { Card, CardContent } from "@/components/ui/card";
import type { UserDashboardData } from "@/types/api/dashboard";
import { Smile, Frown, Meh } from "lucide-react";
import { format, parseISO } from "date-fns";

interface ProgressTrackingProps {
  progress: UserDashboardData["progress"];
}

export default function ProgressTracking({ progress }: ProgressTrackingProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-6">Progress Tracking</h2>

        {/* Treatment Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Treatment Progress</h3>
            <span className="text-sm font-bold">
              {progress.treatmentProgress}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress.treatmentProgress}%` }}
            />
          </div>
        </div>

        {/* Weekly Engagement */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Weekly Engagement</h3>
            <span className="text-sm font-bold">
              {progress.weeklyEngagement}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${progress.weeklyEngagement}%` }}
            />
          </div>
        </div>

        {/* Weekly Mood Chart */}
        <div>
          <h3 className="text-sm font-medium mb-4">Weekly Mood</h3>
          <div className="grid grid-cols-7 gap-1">
            {progress.weeklyMood.map((day, index) => {
              // Get the right emoji based on mood value (1-5)
              const moodIcon = getMoodIcon(day.value);
              // Format date to get just the day name (Mon, Tue, etc.)
              const dayName = format(parseISO(day.date), "EEE");

              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${getMoodColor(day.value)}`}
                  >
                    {moodIcon}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground">
                    {dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mood Legend */}
        <div className="mt-6 pt-4 border-t flex justify-between">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-100"></div>
            <span className="text-xs text-muted-foreground">Bad</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-100"></div>
            <span className="text-xs text-muted-foreground">Poor</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-100"></div>
            <span className="text-xs text-muted-foreground">Okay</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-100"></div>
            <span className="text-xs text-muted-foreground">Good</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-100"></div>
            <span className="text-xs text-muted-foreground">Great</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get mood icon based on value (1-5)
function getMoodIcon(value: number) {
  switch (value) {
    case 1:
      return <Frown className="h-4 w-4 text-red-500" />;
    case 2:
      return <Frown className="h-4 w-4 text-orange-500" />;
    case 3:
      return <Meh className="h-4 w-4 text-yellow-500" />;
    case 4:
      return <Smile className="h-4 w-4 text-blue-500" />;
    case 5:
      return <Smile className="h-4 w-4 text-green-500" />;
    default:
      return <Meh className="h-4 w-4 text-gray-500" />;
  }
}

// Helper function to get mood background color
function getMoodColor(value: number) {
  switch (value) {
    case 1:
      return "bg-red-100";
    case 2:
      return "bg-orange-100";
    case 3:
      return "bg-yellow-100";
    case 4:
      return "bg-blue-100";
    case 5:
      return "bg-green-100";
    default:
      return "bg-gray-100";
  }
}
