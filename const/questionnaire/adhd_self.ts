interface SeverityLevel {
  range: number[];
  label: string;
}

interface SeverityLevels {
  low: SeverityLevel;
  mildToModerate: SeverityLevel;
  high: SeverityLevel;
  veryHigh: SeverityLevel;
}

interface Scoring {
  scoreOptions: Record<number, number>;
  partA: { range: number[]; severityLevels: SeverityLevels };
  partB: { range: number[]; severityLevels: SeverityLevels };
  totalScore: { range: number[]; severityLevels: SeverityLevels };
  getSeverity: (score: number, part: "A" | "B" | "Total") => string;
}

const ASRS_V1_1 = {
  description:
    "The Adult ADHD Self-Report Scale (ASRS v1.1) is a self-administered questionnaire used to screen for ADHD symptoms in adults over the past 6 months. It assesses inattentiveness, hyperactivity, and impulsivity based on DSM-5 criteria.",

  questions: [
    "Trouble wrapping up final details of a project after the challenging parts are done",
    "Difficulty getting things in order when a task requires organization",
    "Problems remembering appointments or obligations",
    "Avoiding or delaying starting tasks that require a lot of thought",
    "Fidgeting or squirming when sitting for a long time",
    "Feeling overly active and compelled to do things, like being driven by a motor",
    "Making careless mistakes when working on a boring or difficult project",
    "Difficulty keeping attention during boring or repetitive tasks",
    "Difficulty concentrating on conversations, even when spoken to directly",
    "Misplacing or having difficulty finding things at home or work",
    "Being easily distracted by activity or noise",
    "Leaving seat in situations where remaining seated is expected",
    "Feeling restless or fidgety",
    "Difficulty unwinding and relaxing when having free time",
    "Talking too much in social situations",
    "Finishing other people’s sentences before they can finish",
    "Difficulty waiting turn in situations requiring turn-taking",
    "Interrupting others when they are busy",
  ],

  scoring: {
    scoreOptions: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
    partA: {
      range: [0, 24],
      severityLevels: {
        low: { range: [0, 9], label: "Low" },
        mildToModerate: { range: [10, 13], label: "Mild to Moderate" },
        high: { range: [14, 17], label: "High" },
        veryHigh: { range: [18, 24], label: "Very High" },
      },
    },
    partB: {
      range: [0, 48],
      severityLevels: {
        low: { range: [0, 19], label: "Low" },
        mildToModerate: { range: [20, 26], label: "Mild to Moderate" },
        high: { range: [27, 32], label: "High" },
        veryHigh: { range: [33, 48], label: "Very High" },
      },
    },
    totalScore: {
      range: [0, 72],
      severityLevels: {
        low: { range: [0, 30], label: "Low" },
        mildToModerate: { range: [31, 39], label: "Mild to Moderate" },
        high: { range: [40, 49], label: "High" },
        veryHigh: { range: [50, 72], label: "Very High" },
      },
    },
    getSeverity: (score: number, part: "A" | "B" | "Total"): string => {
      const ranges: SeverityLevels =
        part === "A"
          ? ASRS_V1_1.scoring.partA.severityLevels
          : part === "B"
          ? ASRS_V1_1.scoring.partB.severityLevels
          : ASRS_V1_1.scoring.totalScore.severityLevels;

      for (const key of Object.keys(ranges) as (keyof SeverityLevels)[]) {
        if (score >= ranges[key].range[0] && score <= ranges[key].range[1]) {
          return ranges[key].label;
        }
      }
      return "Invalid score";
    },
  },

  disclaimer:
    "This questionnaire is a screening tool and does not provide a definitive diagnosis. A clinical evaluation by a healthcare professional is necessary for a formal ADHD diagnosis.",
};

export default ASRS_V1_1;
