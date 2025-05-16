import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LIST_OF_QUESTIONNAIRES } from "@/constants/questionnaires";
import { cn } from "@/lib/utils";
import { usePreAssessmentChecklistStore } from "@/store/pre-assessment";

export default function PreAssessmentInitialCheckList({
  handleNextButtonOnClick,
}: {
  handleNextButtonOnClick: () => void;
}) {
  const { questionnaires, setQuestionnaires } =
    usePreAssessmentChecklistStore();

  return (
    <>
      <div className="w-full shadow-[inset_0_-4px_4px_-2px_rgba(0,0,0,0.2)] p-8">
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
                  questionnaires.filter(
                    (questionnaire) => questionnaire !== item
                  )
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
      </div>

      <div className="bg-white px-10 py-3">
        <Button
          className="w-full font-bold"
          variant={"secondary"}
          disabled={questionnaires.length === 0}
          onClick={handleNextButtonOnClick}
        >
          Submit
        </Button>
      </div>
    </>
  );
}
