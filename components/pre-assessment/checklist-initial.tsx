import {
  LIST_OF_QUESTIONNAIRES,
  ListOfQuestionnaires,
} from "@/const/list-of-questionnaires";
import React from "react";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";

export default function PreAssessmentInitialCheckList() {
  const [checked, setChecked] = React.useState<ListOfQuestionnaires[]>([]);

  function handleCheckboxChange(key: ListOfQuestionnaires, value: boolean) {
    if (value === true) {
      setChecked((prev) => [...prev, key]);
    } else {
      setChecked((prev) => prev.filter((item) => item !== key));
    }
  }

  return (
    <div className="">
      <div>
        <h3 className="text-secondary font-semibold">
          What can we help you with today?
        </h3>
        <p className="text-black/70 font-xs">Select all that apply</p>

        <div className="space-y-2">
          {LIST_OF_QUESTIONNAIRES.map((item) => {
            const isChecked = checked.includes(item);

            return (
              <div
                key={item}
                className="flex items-center gap-4 bg-white py-2 px-6 rounded-full"
              >
                <Checkbox
                  onCheckedChange={() => handleCheckboxChange(item, !isChecked)}
                />
                <label>{item}</label>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <Button className="w-full" variant={"secondary"}>
          Next
        </Button>
      </div>
    </div>
  );
}
