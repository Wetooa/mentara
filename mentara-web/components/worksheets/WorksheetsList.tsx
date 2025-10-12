import React from "react";
import { useRouter } from "next/navigation";
import { Task } from "./types";
import { FileText, Sparkles } from "lucide-react";
import TaskCard from "./TaskCard";
import { motion } from "framer-motion";

interface WorksheetsListProps {
  tasks: Task[];
}

export default function WorksheetsList({ tasks }: WorksheetsListProps) {
  const router = useRouter();

  // Group tasks by date
  const groupTasksByDate = () => {
    const groups: { [key: string]: Task[] } = {};

    tasks.forEach((task) => {
      if (!groups[task.date]) {
        groups[task.date] = [];
      }
      groups[task.date].push(task);
    });

    // Sort dates in descending order (newest first)
    return Object.keys(groups)
      .sort()
      .reverse()
      .map((date) => ({
        date,
        formattedDate: formatDate(date),
        tasks: groups[date],
      }));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    const dayOfWeek = date.toLocaleString("default", { weekday: "long" });

    return `${month} ${day}${getDaySuffix(day)} ${dayOfWeek}`;
  };

  const getDaySuffix = (day: number) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const handleSelectTask = (task: Task) => {
    router.push(`/client/worksheets/${task.id}`);
  };

  const taskGroups = groupTasksByDate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const groupVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 h-full">
      {taskGroups.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto"
        >
          {taskGroups.map((group, groupIndex) => (
            <motion.div key={group.date} variants={groupVariants} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                <h3 className="text-lg font-bold text-gray-900">
                  {group.formattedDate}
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent"></div>
              </div>

              <div className="space-y-3">
                {group.tasks.map((task, taskIndex) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: groupIndex * 0.1 + taskIndex * 0.05 }}
                    onClick={() => handleSelectTask(task)}
                  >
                    <TaskCard task={task} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          className="flex flex-col items-center justify-center h-full text-gray-500"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-full p-8 mb-4">
            <FileText className="h-16 w-16 text-primary" />
          </div>
          <p className="text-xl font-bold text-gray-900 mb-1">No worksheets found</p>
          <p className="text-sm text-gray-500">Try adjusting your filters to see more results</p>
          <div className="mt-4 flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Your completed work will appear here</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
