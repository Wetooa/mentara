export const OnboardingStepper = ({ steps }) => {
  return (
    <div className="flex flex-col mt-8">
      {steps.map((step, index) => (
        <div key={index} className="relative">
          {/* Step with circle and label */}
          <div className="flex items-center gap-2 z-10 relative">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                step.completed
                  ? "bg-green-600"
                  : "bg-white border border-gray-300"
              }`}
            >
              {step.completed && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </div>
            <p className="text-sm font-medium text-gray-700">{step.label}</p>
          </div>

          {/* Connection line (don't show for last item) */}
          {index < steps.length - 1 && (
            <div
              className={`absolute left-3 top-6 w-[2px] h-[calc(100%-6px)] -translate-x-1/2 ${
                steps[index].completed && steps[index + 1]?.completed // Check next step safely
                  ? "bg-green-600"
                  : steps[index].completed
                    ? "bg-gradient-to-b from-green-600 to-gray-300"
                    : "bg-gray-300"
              }`}
              style={{ zIndex: 0 }}
            />
          )}

          {/* Add spacing between items */}
          {index < steps.length - 1 && <div className="h-8" />}
        </div>
      ))}
    </div>
  );
};
