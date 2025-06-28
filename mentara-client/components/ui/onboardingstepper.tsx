interface Step {
  label: string;
  completed: boolean;
  description?: string;
  estimatedTime?: string;
  current?: boolean;
}

interface OnboardingStepperProps {
  steps: Step[];
  currentStep?: number;
}

export const OnboardingStepper = ({ steps, currentStep = 0 }: OnboardingStepperProps) => {
  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = Math.round((completedSteps / steps.length) * 100);

  return (
    <div className="flex flex-col mt-8">
      {/* Progress Overview */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-green-800">Progress</span>
          <span className="text-sm font-bold text-green-700">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-green-200 rounded-full h-2 mb-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-green-700">
          {completedSteps} of {steps.length} steps completed
        </p>
      </div>

      {/* Steps */}
      {steps.map((step, index) => {
        const isCurrent = index === currentStep;
        const isCompleted = step.completed;
        const isUpcoming = index > currentStep;
        
        return (
          <div key={index} className="relative">
            {/* Step with circle and label */}
            <div className={`flex items-start gap-3 z-10 relative p-3 rounded-lg transition-all duration-200 ${
              isCurrent ? 'bg-blue-50 border border-blue-200' : ''
            }`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  isCompleted
                    ? "bg-green-600 shadow-lg"
                    : isCurrent
                    ? "bg-blue-600 shadow-lg animate-pulse"
                    : "bg-white border-2 border-gray-300"
                }`}
              >
                {isCompleted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : isCurrent ? (
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                ) : (
                  <span className="text-xs font-bold text-gray-500">{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-sm font-semibold transition-colors ${
                    isCompleted ? 'text-green-800' : 
                    isCurrent ? 'text-blue-800' : 
                    'text-gray-600'
                  }`}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      Current
                    </span>
                  )}
                  {isCompleted && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Complete
                    </span>
                  )}
                </div>
                
                {step.description && (
                  <p className={`text-xs mb-1 ${
                    isCompleted ? 'text-green-600' : 
                    isCurrent ? 'text-blue-600' : 
                    'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                )}
                
                {step.estimatedTime && !isCompleted && (
                  <p className="text-xs text-gray-400">
                    Estimated time: {step.estimatedTime}
                  </p>
                )}
              </div>
            </div>

            {/* Connection line (don't show for last item) */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-6 top-12 w-[2px] h-[calc(100%-12px)] -translate-x-1/2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-green-600"
                    : isCurrent
                    ? "bg-gradient-to-b from-blue-600 to-gray-300"
                    : "bg-gray-300"
                }`}
                style={{ zIndex: 0 }}
              />
            )}

            {/* Add spacing between items */}
            {index < steps.length - 1 && <div className="h-2" />}
          </div>
        )
      })}
    </div>
  );
};
