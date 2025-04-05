import React from "react";
import QuestionnaireForm from "./questionnaire-form";
import PERCEIVED_STRESS_SCALE from "@/const/questionnaire/perceived-stress-scale";

export default function StressForm() {
  const questionnaire = PERCEIVED_STRESS_SCALE;

  return <QuestionnaireForm questions={questionnaire.questions} />;
}
