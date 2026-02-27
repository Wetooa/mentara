import { ListOfQuestionnaires } from "./questionnaire-mapping";

export type RapportImpactCategory =
    | "energy_physical"
    | "focus_productivity"
    | "emotional_mood"
    | "social_interpersonal"
    | "control_coping";

export interface RapportChoice {
    text: string;
    weights: Partial<Record<ListOfQuestionnaires, number>>;
}

export interface RapportQuestion {
    id: RapportImpactCategory;
    title: string;
    choices: [RapportChoice, RapportChoice, RapportChoice, RapportChoice, RapportChoice];
}

export const RAPPORT_QUESTIONS: RapportQuestion[] = [
    {
        id: "energy_physical",
        title: "How has your physical energy or sleep been lately?",
        choices: [
            {
                text: "I can’t get restful sleep or feel physically drained.",
                weights: {
                    "Insomnia": 5, // Max weight for ISI
                    "Burnout": 3,
                }
            },
            {
                text: "I feel sudden physical surges of panic, tension, or a racing heart.",
                weights: {
                    "Panic": 5, // Max weight for PDSS
                    "Anxiety": 3,
                }
            },
            {
                text: "My body aches and I feel heavy, making it hard to leave bed.",
                weights: {
                    "Depression": 5, // Max weight for PHQ-9
                    "Burnout": 2,
                }
            },
            {
                text: "I feel jumpy, constantly on edge, and my muscles are tight.",
                weights: {
                    "Anxiety": 5, // Max weight for GAD-7
                    "Stress": 3,
                }
            },
            {
                text: "I feel physically fine, but I'm just here for a general check-in.",
                weights: {
                    "Stress": 5, // Max weight for PSS
                }
            }
        ]
    },
    {
        id: "focus_productivity",
        title: "How would you describe your focus and ability to stay productive?",
        choices: [
            {
                text: "I can’t start tasks, stay focused, or finish things I started.",
                weights: {
                    "ADD / ADHD": 5, // Max weight for ASRS
                    "Burnout": 2,
                }
            },
            {
                text: "I’m stuck on specific thoughts and must do things 'perfectly'.",
                weights: {
                    "Obsessive compulsive disorder (OCD)": 5, // Max weight for OCI-R
                }
            },
            {
                text: "I feel completely unmotivated and nothing seems worth the effort.",
                weights: {
                    "Depression": 4,
                    "Burnout": 4,
                }
            },
            {
                text: "My racing thoughts make it impossible to concentrate on one thing.",
                weights: {
                    "Anxiety": 3,
                    "Bipolar disorder (BD)": 5, // Max weight for MDQ
                }
            },
            {
                text: "I'm keeping up with work, but the constant pressure is exhausting.",
                weights: {
                    "Burnout": 5, // Max weight for MBI
                    "Stress": 3,
                }
            }
        ]
    },
    {
        id: "emotional_mood",
        title: "In general, how have your emotions or mood been lately?",
        choices: [
            {
                text: "I feel a heavy, persistent low, sadness, or loss of interest.",
                weights: {
                    "Depression": 5,
                }
            },
            {
                text: "My mood swings wildly from very high energy/euphoria to very low.",
                weights: {
                    "Bipolar disorder (BD)": 5,
                }
            },
            {
                text: "I feel a constant sense of dread, worry, or fear about the future.",
                weights: {
                    "Anxiety": 5,
                    "Panic": 2,
                }
            },
            {
                text: "I feel emotionally numb and disconnected from my surroundings.",
                weights: {
                    "Post-traumatic stress disorder (PTSD)": 5, // Max weight for PCL-5
                    "Depression": 2,
                }
            },
            {
                text: "My emotions are mostly stable, just occasional frustration.",
                weights: {
                    "Stress": 4,
                }
            }
        ]
    },
    {
        id: "social_interpersonal",
        title: "How are your social interactions and connections with others?",
        choices: [
            {
                text: "I am terrified of social judgment, being watched, or criticized.",
                weights: {
                    "Social anxiety": 5, // Max weight for SPIN
                }
            },
            {
                text: "I avoid people or places that remind me of a past traumatic event.",
                weights: {
                    "Post-traumatic stress disorder (PTSD)": 5,
                }
            },
            {
                text: "I isolate myself because I simply don't have the energy to interact.",
                weights: {
                    "Depression": 4,
                    "Burnout": 3,
                }
            },
            {
                text: "I have intense, irrational fears of specific things or situations.",
                weights: {
                    "Phobia": 5, // Max weight for Specific Phobia
                }
            },
            {
                text: "I interact well with others, but socializing has felt draining lately.",
                weights: {
                    "Burnout": 3,
                    "Social anxiety": 2,
                }
            }
        ]
    },
    {
        id: "control_coping",
        title: "How do you feel about your level of control and coping habits?",
        choices: [
            {
                text: "I’m using drugs, pills, or excessive habits to numb my feelings.",
                weights: {
                    "Drug Abuse": 5, // Max weight for DAST
                    "Substance or Alcohol Use Issues": 3,
                }
            },
            {
                text: "I rely heavily on alcohol to cope with my daily stressors.",
                weights: {
                    "Substance or Alcohol Use Issues": 5, // Max weight for AUDIT
                }
            },
            {
                text: "My relationship with food or body image feels out of control.",
                weights: {
                    "Binge eating / Eating disorders": 5, // Max weight for BES
                }
            },
            {
                text: "I perform repetitive actions or rituals to feel a sense of control.",
                weights: {
                    "Obsessive compulsive disorder (OCD)": 5,
                }
            },
            {
                text: "I feel relatively in control, though I occasionally overindulge.",
                weights: {
                    "Stress": 3,
                }
            }
        ]
    }
];
