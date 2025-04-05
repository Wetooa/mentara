import React from "react";

export default function SignUp() {
  return (
    <>
      <div className="mb-8 text-center">
        <p className="text-xs text-black/80">{question.prefix}</p>
        <p className="text-lg text-center text-secondary">
          {question.question}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {question.options.map((option, index) => {
          return (
            <Button
              variant={currentAnswer === index ? "default" : "unclicked"}
              key={index}
              onClick={() => handleSelectAnswer(index)}
            >
              {option}
            </Button>
          );
        })}
      </div>
    </>
  );
}
