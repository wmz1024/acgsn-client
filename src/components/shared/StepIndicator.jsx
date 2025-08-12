import { CheckCircle } from "lucide-react";

export const StepIndicator = ({ steps, currentStep, stepCompleted }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center ${
              index < steps.length - 1 ? "flex-1" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                index <= currentStep
                  ? stepCompleted[index]
                    ? "bg-green-500 text-white"
                    : "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {stepCompleted[index] ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                index + 1
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  index < currentStep || stepCompleted[index] ? "bg-green-500" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <p className="text-sm text-center text-muted-foreground">
        {steps[currentStep]}
      </p>
    </div>
  );
}; 