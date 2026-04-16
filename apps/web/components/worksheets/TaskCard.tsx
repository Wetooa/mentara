import { Task } from "./types";
import { FileText, Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import WorksheetProgress from "./WorksheetProgress";
import { motion } from "framer-motion";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  // Determine status styling
  const getStatusConfig = () => {
    if (task.status === "reviewed") {
      return {
        bg: "from-blue-50 to-cyan-50",
        border: "border-blue-200/50",
        icon: <CheckCircle className="h-5 w-5 text-blue-600" />,
        iconBg: "bg-blue-100",
        badge: { text: "Reviewed", bg: "bg-blue-500", textColor: "text-white" }
      };
    }
    if (task.status === "completed") {
      return {
        bg: "from-green-50 to-emerald-50",
        border: "border-green-200/50",
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        iconBg: "bg-green-100",
        badge: { text: "Completed", bg: "bg-green-500", textColor: "text-white" }
      };
    }
    if (task.status === "past_due" || task.status === "overdue") {
      return {
        bg: "from-red-50 to-orange-50",
        border: "border-red-200/50",
        icon: <AlertCircle className="h-5 w-5 text-red-600" />,
        iconBg: "bg-red-100",
        badge: { text: "Past Due", bg: "bg-red-500", textColor: "text-white" }
      };
    }
    return {
      bg: "from-primary/5 to-primary/10",
      border: "border-primary/20",
      icon: <FileText className="h-5 w-5 text-primary" />,
      iconBg: "bg-primary/10",
      badge: { text: "Assigned", bg: "bg-gray-200", textColor: "text-gray-700" }
    };
  };

  const config = getStatusConfig();

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`bg-gradient-to-r ${config.bg} rounded-xl shadow-sm p-5 hover:shadow-lg transition-all border ${config.border} cursor-pointer`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2.5 ${config.iconBg} rounded-lg flex-shrink-0`}>
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 mb-1 truncate">{task.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{task.therapistName}</p>
            
            {/* Due Date with icon */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>Due: {new Date(task.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}</span>
            </div>

            {/* Submitted Date if applicable */}
            {task.submittedAt && (
              <div className="flex items-center gap-1.5 text-xs text-green-600 mt-1 font-medium">
                <Clock className="h-3.5 w-3.5" />
                <span>Submitted: {new Date(task.submittedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric"
                })}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Status Badge */}
          <div className={`${config.badge.bg} ${config.badge.textColor} px-3 py-1 rounded-full text-xs font-semibold`}>
            {config.badge.text}
          </div>
          
          {/* Progress */}
          <WorksheetProgress task={task} showDetails={false} />
        </div>
      </div>
    </motion.div>
  );
}
