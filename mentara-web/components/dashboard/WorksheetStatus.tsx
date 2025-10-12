import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UserDashboardData } from "@/types/api/dashboard";
import {
  ArrowRight,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format, parseISO, isToday } from "date-fns";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface WorksheetStatusProps {
  worksheets: UserDashboardData["worksheets"];
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
      staggerChildren: 0.1,
    },
  },
};

const worksheetCardVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const progressBarVariants = {
  hidden: { width: 0 },
  visible: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      duration: 1,
      ease: "easeOut" as const,
      delay: 0.5,
    },
  }),
};

export default function WorksheetStatus({ worksheets }: WorksheetStatusProps) {
  const router = useRouter();

  // Group worksheets by status
  const pendingWorksheets = worksheets.filter((ws) => ws.status === "pending");
  const overdueWorksheets = worksheets.filter((ws) => ws.status === "overdue");

  // Check if there are worksheets due today
  const dueTodayWorksheets = worksheets.filter(
    (ws) =>
      ws.dueDate && isToday(parseISO(ws.dueDate)) && ws.status !== "completed"
  );

  const handleViewAll = () => {
    router.push("client/worksheets");
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden border-border/50">
        <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 px-4 sm:px-6 py-3 border-b border-border/50">
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            variants={sectionVariants}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-bold">Worksheets</h2>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-1 self-start"
                onClick={handleViewAll}
              >
                View All <ArrowRight size={16} />
              </Button>
            </motion.div>
          </motion.div>
        </div>
        <CardContent className="p-4 sm:p-5">

          <motion.div className="space-y-6" variants={containerVariants}>
            {/* Worksheets due today */}
            {dueTodayWorksheets.length > 0 && (
              <motion.div variants={sectionVariants}>
                <h3 className="text-md font-semibold mb-3 text-primary">
                  Due Today
                </h3>
                <div className="space-y-3">
                  {dueTodayWorksheets.map((worksheet, index) => (
                    <WorksheetCard
                      key={worksheet.id}
                      worksheet={worksheet}
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Pending worksheets */}
            {pendingWorksheets.length > 0 && (
              <motion.div variants={sectionVariants}>
                <h3 className="text-md font-semibold mb-3 text-muted-foreground">
                  Pending
                </h3>
                <div className="space-y-3">
                  {pendingWorksheets
                    .filter(
                      (ws) => ws.dueDate && !isToday(parseISO(ws.dueDate))
                    )
                    .slice(0, 3)
                    .map((worksheet, index) => (
                      <WorksheetCard
                        key={worksheet.id}
                        worksheet={worksheet}
                        index={index}
                      />
                    ))}
                </div>
              </motion.div>
            )}

            {/* Overdue worksheets */}
            {overdueWorksheets.length > 0 && (
              <motion.div variants={sectionVariants}>
                <h3 className="text-md font-semibold mb-3 text-red-500">
                  Overdue
                </h3>
                <div className="space-y-3">
                  {overdueWorksheets.slice(0, 2).map((worksheet, index) => (
                    <WorksheetCard
                      key={worksheet.id}
                      worksheet={worksheet}
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* If no worksheets are assigned */}
            {worksheets.length === 0 && (
              <motion.div
                className="text-center py-8 text-muted-foreground"
                variants={sectionVariants}
              >
                No worksheets assigned
              </motion.div>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Helper component for individual worksheet card
function WorksheetCard({
  worksheet,
  index = 0,
}: {
  worksheet: UserDashboardData["worksheets"][0];
  index?: number;
}) {
  // Format dates
  const assignedDate = format(parseISO(worksheet.assignedDate), "MMM d");
  const dueDate = format(parseISO(worksheet.dueDate), "MMM d");

  // Determine status properties
  const statusProps = {
    pending: {
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      label: "Pending",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    completed: {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      label: "Completed",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    overdue: {
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      label: "Overdue",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
  };

  const status = statusProps[worksheet.status];

  return (
    <motion.div
      variants={worksheetCardVariants}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.2 },
      }}
      className={`p-3 sm:p-4 rounded-lg border ${status.bgColor}`}
    >
      <div className="flex flex-col sm:flex-row items-start gap-3">
        <motion.div
          className="p-2 bg-white rounded-md flex-shrink-0 self-start sm:self-auto"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: 0.2 + index * 0.1,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        </motion.div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm sm:text-base truncate">
            {worksheet.title}
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            Assigned by {worksheet.therapistName}
          </p>
          <div className="text-xs text-muted-foreground mt-1">
            Assigned: {assignedDate} · Due: {dueDate}
          </div>
        </div>

        {/* Mobile: Status and progress in a row */}
        <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-0 w-full sm:w-auto">
          <motion.div
            className={`flex items-center gap-1 ${status.color} text-xs sm:text-sm font-medium flex-shrink-0`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            {status.icon}
            <span className="hidden sm:inline">{status.label}</span>
          </motion.div>

          <div className="flex items-center gap-2 sm:block sm:mt-2 flex-1 sm:flex-none">
            <div className="flex-1 sm:w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                variants={progressBarVariants}
                initial="hidden"
                animate="visible"
                custom={worksheet.progress}
              />
            </div>
            <motion.span
              className="text-xs text-muted-foreground flex-shrink-0 sm:mt-1 sm:text-right sm:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 + index * 0.1 }}
            >
              {worksheet.progress}%
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
