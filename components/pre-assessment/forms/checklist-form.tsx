import { buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LIST_OF_QUESTIONNAIRES } from "@/const/list-of-questionnaires";
import { cn } from "@/lib/utils";
import { usePreAssessmentChecklistStore } from "@/store/preassessment";
import { useEffect } from "react";

export default function PreAssessmentInitialCheckList() {
  const { questionnaires, setQuestionnaires, setNextDisabled } =
    usePreAssessmentChecklistStore();

  useEffect(() => {
    if (questionnaires.length === 0) {
      setNextDisabled(true);
    } else {
      setNextDisabled(false);
    }
  }, [questionnaires, setNextDisabled]);

  return (
    <>
      <div className="w-full mb-8 text-center">
        <h4 className="text-lg text-center text-secondary">
          What can we help you with today?
        </h4>
        <p className="text-xs text-black/80">Select all that apply</p>
      </div>
      <div className="w-full flex flex-col gap-2">
        {LIST_OF_QUESTIONNAIRES.map((item) => {
          const isSelected = questionnaires.includes(item);

          const handleSelect = () => {
            if (isSelected) {
              setQuestionnaires(
                questionnaires.filter((questionnaire) => questionnaire !== item)
              );
            } else {
              setQuestionnaires([...questionnaires, item]);
            }
          };

          return (
            <div
              onClick={handleSelect}
              key={item}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "justify-start px-6 gap-4"
              )}
            >
              <Checkbox onClick={handleSelect} checked={isSelected} />
              <label>{item}</label>
            </div>
          );
        })}
      </div>
    </>
  );
}
