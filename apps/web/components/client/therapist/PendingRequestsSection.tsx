"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  THERAPIST_HOVER, 
  THERAPIST_STAGGER, 
  THERAPIST_STATUS,
  THERAPIST_LOADING,
  THERAPIST_EASING 
} from "@/lib/animations";
import { Clock, Loader2, AlertCircle } from "lucide-react";
import { useTherapistRequests } from "@/hooks/client/useTherapistRequests";
import TherapistRequestCard from "./TherapistRequestCard";

export default function PendingRequestsSection() {
  // Fetch pending therapist requests using our new hook
  const { 
    pendingRequests, 
    isLoading, 
    error, 
    cancelRequest, 
    isCancelingRequest 
  } = useTherapistRequests();
  
  // Handle loading state with animated loader
  if (isLoading) {
    return (
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Pending Requests</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <motion.div 
            className="flex items-center gap-2 text-gray-500"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-5 w-5" />
            </motion.div>
            <span>Loading your requests...</span>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Handle error state with animated error indicator
  if (error) {
    return (
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Pending Requests</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <motion.div 
            className="flex items-center gap-2 text-red-600"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <AlertCircle className="h-5 w-5" />
            </motion.div>
            <span>Failed to load requests. Please try again later.</span>
          </motion.div>
        </div>
      </motion.div>
    );
  }
  
  // Get only the first 3 requests to display
  const displayRequests = pendingRequests.slice(0, 3);

  // Handle empty state with enhanced animation
  if (pendingRequests.length === 0) {
    return (
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.25, 0, 1] }}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Pending Requests</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <motion.div 
            className="text-center text-gray-500"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            </motion.div>
            <motion.p 
              className="text-lg font-medium mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              No pending requests
            </motion.p>
            <motion.p 
              className="text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              Your therapist connection requests will appear here
            </motion.p>
            <motion.p 
              className="text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              Visit the "Find a Therapist" tab to send requests
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const handleCancelRequest = async (therapistId: string) => {
    try {
      await cancelRequest(therapistId);
    } catch (error) {
      console.error("Failed to cancel request:", error);
    }
  };

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.25, 0, 1] }}
    >
      {/* Header with animation */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <h2 className="text-xl font-bold text-gray-800">Pending Requests</h2>
        {pendingRequests.length > 3 && (
          <motion.div
            whileHover={THERAPIST_HOVER.subtle}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors duration-200 self-start sm:self-auto">
              View all ({pendingRequests.length})
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Animated Request Cards with Staggered Entry */}
      <motion.div 
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={THERAPIST_STAGGER.container}
      >
        <AnimatePresence mode="popLayout">
          {displayRequests.map((request, index) => (
            <motion.div
              key={request.id}
              variants={THERAPIST_STAGGER.item}
              layout
              whileHover={{ 
                y: -4,
                transition: { duration: 0.2, ease: THERAPIST_EASING.easeOut }
              }}
            >
              <TherapistRequestCard
                request={request}
                onCancel={handleCancelRequest}
                isCanceling={isCancelingRequest}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      
      {/* Enhanced Info Section with Animation */}
      {pendingRequests.length > 0 && (
        <motion.div 
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            delay: 0.5 + (displayRequests.length * 0.1), 
            duration: 0.4, 
            ease: [0.25, 0.25, 0, 1] 
          }}
          whileHover={THERAPIST_HOVER.container}
        >
          <div className="flex items-start gap-3">
            <motion.div 
              className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                {...THERAPIST_STATUS.pulse}
              >
                <Clock className="h-3 w-3 text-blue-600" />
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: 0.6 + (displayRequests.length * 0.1), 
                duration: 0.3 
              }}
            >
              <p className="text-sm font-medium text-blue-900 mb-1">
                About Pending Requests
              </p>
              <p className="text-xs text-blue-700">
                Therapists typically respond within 24-48 hours. You'll receive a notification when they accept or decline your request.
                You can cancel any pending request at any time.
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}