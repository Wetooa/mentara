import { QUESTIONNAIRE_SCORING, QuestionnaireProps } from "../scoring";

const BES: QuestionnaireProps = {
  title: "Binge-Eating Scale (BES)",
  description:
    "The Binge-Eating Scale (BES) is a self-assessment tool designed to evaluate the severity of binge-eating behaviors. It helps individuals understand their eating patterns and whether they may indicate symptoms consistent with binge-eating disorder.",
  questions: [
    {
      prefix: "Body Image",
      question:
        "Body image and self-consciousness regarding weight and size in social settings.",
      options: [
        "I don't feel self-conscious about my weight or body size when I'm with others or I feel concerned but not disappointed with myself.",
        "I do get self-conscious about my appearance and weight which makes me feel disappointed in myself.",
        "I feel very self-conscious about my weight and frequently feel intense shame and disgust for myself; I try to avoid social contacts.",
      ],
    },
    {
      prefix: "Eating Pace",
      question: "Eating speed and resulting physical sensations of fullness.",
      options: [
        "I don't have any difficulty eating slowly in the proper manner.",
        "I seem to 'gobble down' foods but don't end up feeling stuffed.",
        "I tend to eat quickly and feel uncomfortably full afterwards.",
        "I have the habit of bolting down my food without really chewing it and feel uncomfortably stuffed.",
      ],
    },
    {
      prefix: "Self-Control",
      question: "Perceived control over eating urges and level of desperation.",
      options: [
        "I feel capable to control my eating urges when I want to.",
        "I feel like I have failed to control my eating more than the average person.",
        "I feel utterly helpless or desperate about trying to get in control of my eating urges.",
      ],
    },
    {
      prefix: "Emotional Eating",
      question: "Habitual eating in response to boredom.",
      options: [
        "I don't have the habit of eating when I'm bored or I can use some other activity to get my mind off it.",
        "I have a strong habit of eating when I'm bored and nothing seems to help me break it.",
      ],
    },
    {
      prefix: "Hunger Awareness",
      question:
        "Impulsive eating and 'mouth hunger' independent of physical hunger.",
      options: [
        "I'm usually physically hungry when I eat something.",
        "Occasionally, I eat something on impulse even though I really am not hungry.",
        "I eat foods I might not enjoy just to satisfy a hungry feeling that isn't physical.",
        "I get a 'mouth hunger' that only sandwiches or filling foods satisfy; I sometimes spit food out.",
      ],
    },
    {
      prefix: "Post-Eating Emotions",
      question: "Feelings of guilt or self-hate following episodes of overeating.",
      options: [
        "I don't feel any guilt or self-hate after I overeat.",
        "After I overeat, occasionally I feel guilt or self-hate.",
        "Almost all the time I experience strong guilt or self-hate after I overeat.",
      ],
    },
    {
      prefix: "Dieting Control",
      question: "Effect of dieting on eating control and 'blown it' mentality.",
      options: [
        "I don't lose total control of my eating when dieting even after periods when I overeat.",
        "Eating a 'forbidden food' makes me feel like I 'blew it' and I eat even more.",
        "I have a habit of starting strict diets but breaking them with a binge; my life is 'feast or famine'.",
      ],
    },
    {
      prefix: "Fullness",
      question:
        "Frequency and severity of feeling uncomfortably stuffed or nauseous.",
      options: [
        "I rarely eat so much food that I feel uncomfortably stuffed afterwards.",
        "Usually about once a month, I eat such a quantity of food, I end up feeling very stuffed.",
        "I have regular periods during the month when I eat large amounts of food.",
        "I regularly feel quite uncomfortable and sometimes nauseous from overeating.",
      ],
    },
    {
      prefix: "Eating Patterns",
      question: "Compensatory behaviors (starving) and nighttime overeating.",
      options: [
        "My calorie intake does not go up very high or go down very low on a regular basis.",
        "Sometimes I try to reduce my caloric intake to almost nothing to compensate for overeating.",
        "I have a regular habit of overeating during the night.",
        "I have week-long periods where I practically starve myself following periods of overeating.",
      ],
    },
    {
      prefix: "Stopping Ability",
      question: "Capacity to stop eating voluntarily and fear of loss of control.",
      options: [
        "I usually am able to stop eating when I want to; I know when 'enough is enough'.",
        "Every so often, I experience a compulsion to eat which I can't seem to control.",
        "Frequently I experience strong urges I can't control, but at other times I can.",
        "I feel incapable of controlling urges and fear not being able to stop eating voluntarily.",
      ],
    },
    {
      prefix: "Satiety Response",
      question: "Ability to stop when full and use of induced vomiting.",
      options: [
        "I don't have any problem stopping eating when I feel full.",
        "I usually can stop when full but occasionally overeat until I'm uncomfortably stuffed.",
        "I have a problem stopping once I start and usually feel uncomfortably stuffed.",
        "I sometimes have to induce vomiting to relieve my stuffed feeling.",
      ],
    },
    {
      prefix: "Social Eating",
      question: "Social eating habits and 'closet eating'.",
      options: [
        "I seem to eat just as much when I'm with others as when I'm by myself.",
        "I don't eat as much with others because I'm self-conscious.",
        "I eat only a small amount when others are present because I'm very embarrassed.",
        "I pick times to overeat when no one will see me because I'm ashamed; I am a 'closet eater'.",
      ],
    },
    {
      prefix: "Meal Structure",
      question: "Daily meal patterns and heavy snacking habits.",
      options: [
        "I eat three meals a day with only occasional or normal snacks.",
        "When I am snacking heavily, I get in the habit of skipping regular meals.",
        "There are regular periods when I seem to be continually eating, with no planned meals.",
      ],
    },
    {
      prefix: "Control Strategies",
      question: "Mental preoccupation with controlling eating urges.",
      options: [
        "I don't think much about trying to control unwanted eating urges.",
        "At least some of the time, my thoughts are pre-occupied with trying to control urges.",
        "I frequently spend much time thinking about how much I ate or trying not to eat.",
        "Most of my waking hours are pre-occupied by thoughts about eating or not eating.",
      ],
    },
    {
      prefix: "Food Preoccupation",
      question: "General preoccupation with food and cravings.",
      options: [
        "I don't think about food a great deal.",
        "I have strong cravings for food but they last only for brief periods of time.",
        "I have days when I can't seem to think about anything else but food.",
        "Most of my days seem to be pre-occupied with thoughts about food; I live to eat.",
      ],
    },
    {
      prefix: "Portion Control",
      question: "Awareness of physical hunger cues and normal portion sizes.",
      options: [
        "I usually know whether or not I'm physically hungry and take the right portion.",
        "Occasionally I feel uncertain about knowing whether or not I'm physically hungry.",
        "I don't have any idea what is a 'normal' amount of food for me.",
      ],
    },
  ],
  scoring: {
    ...QUESTIONNAIRE_SCORING,
    scoreMapping: { 0: 0, 1: 1, 2: 2, 3: 3 },
    severityLevels: {
      minimal: { range: [0, 17], label: "No or Minimal Binge-Eating" },
      mildModerate: { range: [18, 26], label: "Mild to Moderate Binge-Eating" },
      severe: { range: [27, 46], label: "Severe Binge-Eating" },
    },
  },
  disclaimer:
    "This questionnaire is a screening tool to assess the severity of binge-eating behaviors. It does not serve as a diagnostic tool and should be followed by a clinical evaluation. If you have concerns about your eating habits, please consult a healthcare professional.",
};

export default BES;
