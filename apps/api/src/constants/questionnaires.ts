// Hardcoded questionnaire questions for AI-driven form generation
// Based on the 201-item pre-assessment structure

export interface QuestionOption {
  value: number;
  label: string;
}

export interface Question {
  id: number; // Global index (0-200)
  localId: number; // Index within questionnaire (0-based)
  text: string;
  type: 'scale' | 'boolean' | 'multiple_choice';
  options: QuestionOption[];
  isReversed?: boolean;
}

export interface QuestionnaireMetadata {
  name: string;
  shortName: string;
  description: string;
  startIndex: number;
  endIndex: number;
  itemCount: number;
  questions: Question[];
}

// Standard 5-point scale (0-4) used by most questionnaires
const SCALE_0_4: QuestionOption[] = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

// Alternative 5-point scale for frequency
const FREQUENCY_SCALE: QuestionOption[] = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Rarely' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Often' },
  { value: 4, label: 'Very often' },
];

// 4-point anxiety scale
const ANXIETY_SCALE: QuestionOption[] = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

// Yes/No boolean scale
const YES_NO_SCALE: QuestionOption[] = [
  { value: 0, label: 'No' },
  { value: 1, label: 'Yes' },
];

// Depression questionnaire (PHQ-15, items 0-14)
const DEPRESSION_QUESTIONS: Question[] = [
  { id: 0, localId: 0, text: 'Little interest or pleasure in doing things', type: 'scale', options: SCALE_0_4 },
  { id: 1, localId: 1, text: 'Feeling down, depressed, or hopeless', type: 'scale', options: SCALE_0_4 },
  { id: 2, localId: 2, text: 'Trouble falling or staying asleep, or sleeping too much', type: 'scale', options: SCALE_0_4 },
  { id: 3, localId: 3, text: 'Feeling tired or having little energy', type: 'scale', options: SCALE_0_4 },
  { id: 4, localId: 4, text: 'Poor appetite or overeating', type: 'scale', options: SCALE_0_4 },
  { id: 5, localId: 5, text: 'Feeling bad about yourself or that you are a failure', type: 'scale', options: SCALE_0_4 },
  { id: 6, localId: 6, text: 'Trouble concentrating on things like reading or watching TV', type: 'scale', options: SCALE_0_4 },
  { id: 7, localId: 7, text: 'Moving or speaking slowly, or being fidgety or restless', type: 'scale', options: SCALE_0_4 },
  { id: 8, localId: 8, text: 'Thoughts that you would be better off dead or hurting yourself', type: 'scale', options: SCALE_0_4 },

];

// ADD/ADHD questionnaire (ASRS, items 15-32)
const ADHD_QUESTIONS: Question[] = [
  { id: 9, localId: 0, text: 'Trouble wrapping up final details of a project', type: 'scale', options: FREQUENCY_SCALE },
  { id: 10, localId: 1, text: 'Difficulty getting things in order', type: 'scale', options: FREQUENCY_SCALE },
  { id: 11, localId: 2, text: 'Problems remembering appointments or obligations', type: 'scale', options: FREQUENCY_SCALE },
  { id: 12, localId: 3, text: 'Avoid or delay getting started on tasks requiring concentration', type: 'scale', options: FREQUENCY_SCALE },
  { id: 13, localId: 4, text: 'Fidget or squirm when sitting for long time', type: 'scale', options: FREQUENCY_SCALE },
  { id: 14, localId: 5, text: 'Feel overly active or compelled to do things', type: 'scale', options: FREQUENCY_SCALE },
  { id: 15, localId: 6, text: 'Make careless mistakes when working on tasks', type: 'scale', options: FREQUENCY_SCALE },
  { id: 16, localId: 7, text: 'Difficulty keeping attention during tasks or activities', type: 'scale', options: FREQUENCY_SCALE },
  { id: 17, localId: 8, text: 'Difficulty concentrating on conversations', type: 'scale', options: FREQUENCY_SCALE },
  { id: 18, localId: 9, text: 'Misplace or have difficulty finding things', type: 'scale', options: FREQUENCY_SCALE },
  { id: 19, localId: 10, text: 'Distracted by activity or noise around you', type: 'scale', options: FREQUENCY_SCALE },
  { id: 20, localId: 11, text: 'Leave your seat in meetings or situations', type: 'scale', options: FREQUENCY_SCALE },
  { id: 21, localId: 12, text: 'Feel restless or fidgety', type: 'scale', options: FREQUENCY_SCALE },
  { id: 22, localId: 13, text: 'Difficulty unwinding and relaxing', type: 'scale', options: FREQUENCY_SCALE },
  { id: 23, localId: 14, text: 'Talk too much in social situations', type: 'scale', options: FREQUENCY_SCALE },
  { id: 24, localId: 15, text: 'Finish other people\'s sentences', type: 'scale', options: FREQUENCY_SCALE },
  { id: 25, localId: 16, text: 'Difficulty waiting your turn', type: 'scale', options: FREQUENCY_SCALE },
  { id: 26, localId: 17, text: 'Interrupt others when they are busy', type: 'scale', options: FREQUENCY_SCALE },

];

// Substance/Alcohol Use questionnaire (AUDIT, items 33-42)
const ALCOHOL_QUESTIONS: Question[] = [
  { id: 27, localId: 0, text: 'How often do you have a drink containing alcohol?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 28, localId: 1, text: 'How many standard drinks do you have on a typical day?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 29, localId: 2, text: 'How often do you have six or more drinks on one occasion?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 30, localId: 3, text: 'Unable to stop drinking once you started?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 31, localId: 4, text: 'Failed to do what was normally expected due to drinking?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 32, localId: 5, text: 'Needed a drink in the morning to get yourself going?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 33, localId: 6, text: 'Had a feeling of guilt or remorse after drinking?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 34, localId: 7, text: 'Unable to remember what happened the night before?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 35, localId: 8, text: 'Have you or someone else been injured as a result of drinking?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 36, localId: 9, text: 'Has someone suggested you cut down on drinking?', type: 'scale', options: FREQUENCY_SCALE },

];

// Binge Eating/Eating Disorders questionnaire (BES, items 43-58)
const EATING_DISORDER_QUESTIONS: Question[] = [
  { id: 37, localId: 0, text: 'Eat large amounts of food when not physically hungry', type: 'scale', options: FREQUENCY_SCALE },
  { id: 38, localId: 1, text: 'Eat much more rapidly than normal during binges', type: 'scale', options: FREQUENCY_SCALE },
  { id: 39, localId: 2, text: 'Eat until feeling uncomfortably full', type: 'scale', options: FREQUENCY_SCALE },
  { id: 40, localId: 3, text: 'Eat alone because embarrassed by how much eating', type: 'scale', options: FREQUENCY_SCALE },
  { id: 41, localId: 4, text: 'Feel disgusted, depressed, or guilty after overeating', type: 'scale', options: FREQUENCY_SCALE },
  { id: 42, localId: 5, text: 'Feel distressed about binge eating', type: 'scale', options: FREQUENCY_SCALE },
  { id: 43, localId: 6, text: 'Preoccupied with thoughts of food', type: 'scale', options: FREQUENCY_SCALE },
  { id: 44, localId: 7, text: 'Try to diet or restrict food to control weight', type: 'scale', options: FREQUENCY_SCALE },
  { id: 45, localId: 8, text: 'Feel out of control when eating', type: 'scale', options: FREQUENCY_SCALE },
  { id: 46, localId: 9, text: 'Eat to escape worries or troubles', type: 'scale', options: FREQUENCY_SCALE },
  { id: 47, localId: 10, text: 'Think about body shape and weight throughout the day', type: 'scale', options: FREQUENCY_SCALE },
  { id: 48, localId: 11, text: 'Feel that eating is the only pleasure in life', type: 'scale', options: FREQUENCY_SCALE },
  { id: 49, localId: 12, text: 'Hide food or eating from others', type: 'scale', options: FREQUENCY_SCALE },
  { id: 50, localId: 13, text: 'Feel afraid of not being able to stop eating', type: 'scale', options: FREQUENCY_SCALE },
  { id: 51, localId: 14, text: 'Feel that life is dominated by conflict about eating', type: 'scale', options: FREQUENCY_SCALE },
  { id: 52, localId: 15, text: 'Use vomiting, laxatives, or excessive exercise to control weight', type: 'scale', options: FREQUENCY_SCALE },

];

// Drug Abuse questionnaire (DAST-10, items 59-68)
const DRUG_ABUSE_QUESTIONS: Question[] = [
  { id: 53, localId: 0, text: 'Used drugs other than for medical reasons?', type: 'scale', options: YES_NO_SCALE },
  { id: 54, localId: 1, text: 'Abused prescription drugs?', type: 'scale', options: YES_NO_SCALE },
  { id: 55, localId: 2, text: 'Used more than one drug at a time?', type: 'scale', options: YES_NO_SCALE },
  { id: 56, localId: 3, text: 'Can you get through the week without using drugs?', type: 'scale', options: YES_NO_SCALE, isReversed: true },
  { id: 57, localId: 4, text: 'Are you always able to stop using drugs when you want to?', type: 'scale', options: YES_NO_SCALE, isReversed: true },
  { id: 58, localId: 5, text: 'Had blackouts or flashbacks as a result of drug use?', type: 'scale', options: YES_NO_SCALE },
  { id: 59, localId: 6, text: 'Ever felt bad or guilty about your drug use?', type: 'scale', options: YES_NO_SCALE },
  { id: 60, localId: 7, text: 'Does your spouse/partner complain about your drug use?', type: 'scale', options: YES_NO_SCALE },
  { id: 61, localId: 8, text: 'Neglected your family because of drug use?', type: 'scale', options: YES_NO_SCALE },
  { id: 62, localId: 9, text: 'Engaged in illegal activities to obtain drugs?', type: 'scale', options: YES_NO_SCALE },

];

// Anxiety questionnaire (GAD-7, items 69-75)
const ANXIETY_QUESTIONS: Question[] = [
  { id: 63, localId: 0, text: 'Feeling nervous, anxious, or on edge', type: 'scale', options: ANXIETY_SCALE },
  { id: 64, localId: 1, text: 'Not being able to stop or control worrying', type: 'scale', options: ANXIETY_SCALE },
  { id: 65, localId: 2, text: 'Worrying too much about different things', type: 'scale', options: ANXIETY_SCALE },
  { id: 66, localId: 3, text: 'Trouble relaxing', type: 'scale', options: ANXIETY_SCALE },
  { id: 67, localId: 4, text: 'Being so restless that it\'s hard to sit still', type: 'scale', options: ANXIETY_SCALE },
  { id: 68, localId: 5, text: 'Becoming easily annoyed or irritable', type: 'scale', options: ANXIETY_SCALE },
  { id: 69, localId: 6, text: 'Feeling afraid as if something awful might happen', type: 'scale', options: ANXIETY_SCALE },

];

// Insomnia questionnaire (ISI, items 76-82)
const INSOMNIA_QUESTIONS: Question[] = [
  { id: 70, localId: 0, text: 'Difficulty falling asleep', type: 'scale', options: FREQUENCY_SCALE },
  { id: 71, localId: 1, text: 'Difficulty staying asleep', type: 'scale', options: FREQUENCY_SCALE },
  { id: 72, localId: 2, text: 'Problems waking up too early', type: 'scale', options: FREQUENCY_SCALE },
  { id: 73, localId: 3, text: 'How satisfied are you with your current sleep pattern?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 74, localId: 4, text: 'How noticeable to others is your sleep problem?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 75, localId: 5, text: 'How worried are you about your current sleep problem?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 76, localId: 6, text: 'How much is your sleep problem interfering with daily functioning?', type: 'scale', options: FREQUENCY_SCALE },

];

// Burnout questionnaire (MBI, items 83-104)
const BURNOUT_QUESTIONS: Question[] = [
  { id: 77, localId: 0, text: 'Feel emotionally drained from your work', type: 'scale', options: FREQUENCY_SCALE },
  { id: 78, localId: 1, text: 'Feel used up at the end of the workday', type: 'scale', options: FREQUENCY_SCALE },
  { id: 79, localId: 2, text: 'Feel fatigued when you get up in the morning', type: 'scale', options: FREQUENCY_SCALE },
  { id: 80, localId: 3, text: 'Working with people all day is strain for you', type: 'scale', options: FREQUENCY_SCALE },
  { id: 81, localId: 4, text: 'Feel burned out from your work', type: 'scale', options: FREQUENCY_SCALE },
  { id: 82, localId: 5, text: 'Feel frustrated by your job', type: 'scale', options: FREQUENCY_SCALE },
  { id: 83, localId: 6, text: 'Feel you\'re working too hard on your job', type: 'scale', options: FREQUENCY_SCALE },
  { id: 84, localId: 7, text: 'Working directly with people puts too much stress on you', type: 'scale', options: FREQUENCY_SCALE },
  { id: 85, localId: 8, text: 'Feel like you\'re at the end of your rope', type: 'scale', options: FREQUENCY_SCALE },
  { id: 86, localId: 9, text: 'Deal effectively with problems of others', type: 'scale', options: FREQUENCY_SCALE },
  { id: 87, localId: 10, text: 'Feel you\'re positively influencing others\' lives', type: 'scale', options: FREQUENCY_SCALE },
  { id: 88, localId: 11, text: 'Can easily understand how others feel', type: 'scale', options: FREQUENCY_SCALE },
  { id: 89, localId: 12, text: 'Deal effectively with others\' problems', type: 'scale', options: FREQUENCY_SCALE },
  { id: 90, localId: 13, text: 'Feel energized by working closely with others', type: 'scale', options: FREQUENCY_SCALE },
  { id: 91, localId: 14, text: 'Accomplished many worthwhile things in this job', type: 'scale', options: FREQUENCY_SCALE },
  { id: 92, localId: 15, text: 'Feel exhilarated after working closely with others', type: 'scale', options: FREQUENCY_SCALE },
  { id: 93, localId: 16, text: 'Created a relaxed atmosphere with others', type: 'scale', options: FREQUENCY_SCALE },
  { id: 94, localId: 17, text: 'Treat some people as if they were impersonal objects', type: 'scale', options: FREQUENCY_SCALE },
  { id: 95, localId: 18, text: 'Become more callous toward people', type: 'scale', options: FREQUENCY_SCALE },
  { id: 96, localId: 19, text: 'Worry that this job is hardening you emotionally', type: 'scale', options: FREQUENCY_SCALE },
  { id: 97, localId: 20, text: 'Don\'t really care what happens to some people', type: 'scale', options: FREQUENCY_SCALE },
  { id: 98, localId: 21, text: 'Feel others blame you for some of their problems', type: 'scale', options: FREQUENCY_SCALE },

];

// Bipolar Disorder questionnaire (MDQ, items 105-119)
const BIPOLAR_QUESTIONS: Question[] = [
  { id: 99, localId: 0, text: 'Feel so good or hyper that others thought you were not your normal self?', type: 'scale', options: YES_NO_SCALE },
  { id: 100, localId: 1, text: 'So irritable that you shouted at people or started fights?', type: 'scale', options: YES_NO_SCALE },
  { id: 101, localId: 2, text: 'Feel much more self-confident than usual?', type: 'scale', options: YES_NO_SCALE },
  { id: 102, localId: 3, text: 'Get much less sleep than usual and not miss it?', type: 'scale', options: YES_NO_SCALE },
  { id: 103, localId: 4, text: 'Much more talkative or spoke faster than usual?', type: 'scale', options: YES_NO_SCALE },
  { id: 104, localId: 5, text: 'Thoughts raced through your head?', type: 'scale', options: YES_NO_SCALE },
  { id: 105, localId: 6, text: 'So easily distracted that any interruption could derail you?', type: 'scale', options: YES_NO_SCALE },
  { id: 106, localId: 7, text: 'Much more energy than usual?', type: 'scale', options: YES_NO_SCALE },
  { id: 107, localId: 8, text: 'Much more active or did many more things than usual?', type: 'scale', options: YES_NO_SCALE },
  { id: 108, localId: 9, text: 'Much more social or outgoing than usual?', type: 'scale', options: YES_NO_SCALE },
  { id: 109, localId: 10, text: 'Much more interested in sex than usual?', type: 'scale', options: YES_NO_SCALE },
  { id: 110, localId: 11, text: 'Did things that were unusual or that others might think risky?', type: 'scale', options: YES_NO_SCALE },
  { id: 111, localId: 12, text: 'Spending money got you or your family in trouble?', type: 'scale', options: YES_NO_SCALE },
  { id: 112, localId: 13, text: 'Have several of these symptoms happened at the same time?', type: 'scale', options: YES_NO_SCALE },
  { id: 113, localId: 14, text: 'How much of a problem did any of these cause you?', type: 'scale', options: FREQUENCY_SCALE },

];

// OCD questionnaire (OCI-R, items 120-137)
const OCD_QUESTIONS: Question[] = [
  { id: 114, localId: 0, text: 'Unpleasant thoughts come into your mind against your will', type: 'scale', options: FREQUENCY_SCALE },
  { id: 115, localId: 1, text: 'Check things more often than necessary', type: 'scale', options: FREQUENCY_SCALE },
  { id: 116, localId: 2, text: 'Get upset if objects are not arranged properly', type: 'scale', options: FREQUENCY_SCALE },
  { id: 117, localId: 3, text: 'Feel compelled to count while doing things', type: 'scale', options: FREQUENCY_SCALE },
  { id: 118, localId: 4, text: 'Difficulty making decisions', type: 'scale', options: FREQUENCY_SCALE },
  { id: 119, localId: 5, text: 'Feel you have to wash or clean excessively', type: 'scale', options: FREQUENCY_SCALE },
  { id: 120, localId: 6, text: 'Check that you did not harm anyone', type: 'scale', options: FREQUENCY_SCALE },
  { id: 121, localId: 7, text: 'Worried that things are not in the right place', type: 'scale', options: FREQUENCY_SCALE },
  { id: 122, localId: 8, text: 'Feel need to repeat certain numbers', type: 'scale', options: FREQUENCY_SCALE },
  { id: 123, localId: 9, text: 'Difficulty finishing things because can\'t get them right', type: 'scale', options: FREQUENCY_SCALE },
  { id: 124, localId: 10, text: 'Bothered by contamination worries', type: 'scale', options: FREQUENCY_SCALE },
  { id: 125, localId: 11, text: 'Check that you did not make a mistake', type: 'scale', options: FREQUENCY_SCALE },
  { id: 126, localId: 12, text: 'Concerned about orderliness or symmetry', type: 'scale', options: FREQUENCY_SCALE },
  { id: 127, localId: 13, text: 'Feel need to do things over and over', type: 'scale', options: FREQUENCY_SCALE },
  { id: 128, localId: 14, text: 'Need to collect certain things', type: 'scale', options: FREQUENCY_SCALE },
  { id: 129, localId: 15, text: 'Wash yourself or household items excessively', type: 'scale', options: FREQUENCY_SCALE },
  { id: 130, localId: 16, text: 'Repeatedly check doors, windows, drawers, etc.', type: 'scale', options: FREQUENCY_SCALE },
  { id: 131, localId: 17, text: 'Get upset if others change the way you arrange things', type: 'scale', options: FREQUENCY_SCALE },

];

// PTSD questionnaire (PCL-5, items 138-157)
const PTSD_QUESTIONS: Question[] = [
  { id: 132, localId: 0, text: 'Repeated, disturbing memories, thoughts, or images of stressful experience?', type: 'scale', options: SCALE_0_4 },
  { id: 133, localId: 1, text: 'Repeated, disturbing dreams of stressful experience?', type: 'scale', options: SCALE_0_4 },
  { id: 134, localId: 2, text: 'Suddenly feeling or acting as if stressful experience were happening again?', type: 'scale', options: SCALE_0_4 },
  { id: 135, localId: 3, text: 'Feeling very upset when reminded of stressful experience?', type: 'scale', options: SCALE_0_4 },
  { id: 136, localId: 4, text: 'Physical reactions when reminded of stressful experience?', type: 'scale', options: SCALE_0_4 },
  { id: 137, localId: 5, text: 'Avoid thinking or talking about stressful experience?', type: 'scale', options: SCALE_0_4 },
  { id: 138, localId: 6, text: 'Avoid activities or situations that remind you of experience?', type: 'scale', options: SCALE_0_4 },
  { id: 139, localId: 7, text: 'Trouble remembering important parts of stressful experience?', type: 'scale', options: SCALE_0_4 },
  { id: 140, localId: 8, text: 'Loss of interest in activities you used to enjoy?', type: 'scale', options: SCALE_0_4 },
  { id: 141, localId: 9, text: 'Feeling distant or cut off from other people?', type: 'scale', options: SCALE_0_4 },
  { id: 142, localId: 10, text: 'Feeling emotionally numb or unable to have loving feelings?', type: 'scale', options: SCALE_0_4 },
  { id: 143, localId: 11, text: 'Feeling as if your future will be cut short?', type: 'scale', options: SCALE_0_4 },
  { id: 144, localId: 12, text: 'Trouble falling or staying asleep?', type: 'scale', options: SCALE_0_4 },
  { id: 145, localId: 13, text: 'Feeling irritable or having angry outbursts?', type: 'scale', options: SCALE_0_4 },
  { id: 146, localId: 14, text: 'Having difficulty concentrating?', type: 'scale', options: SCALE_0_4 },
  { id: 147, localId: 15, text: 'Being "super alert" or watchful or on guard?', type: 'scale', options: SCALE_0_4 },
  { id: 148, localId: 16, text: 'Feeling jumpy or easily startled?', type: 'scale', options: SCALE_0_4 },
  { id: 149, localId: 17, text: 'Being reckless or self-destructive?', type: 'scale', options: SCALE_0_4 },
  { id: 150, localId: 18, text: 'Feeling guilty or blaming yourself?', type: 'scale', options: SCALE_0_4 },
  { id: 151, localId: 19, text: 'Feeling ashamed or having negative beliefs about yourself?', type: 'scale', options: SCALE_0_4 },

];

// Panic questionnaire (PDSS, items 158-164)
const PANIC_QUESTIONS: Question[] = [
  { id: 152, localId: 0, text: 'Experienced panic attacks or sudden rushes of intense fear or discomfort?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 153, localId: 1, text: 'How distressing were the panic attacks?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 154, localId: 2, text: 'How afraid were you of having another panic attack?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 155, localId: 3, text: 'Avoided situations or changed your lifestyle because of panic?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 156, localId: 4, text: 'Avoided physical sensations like rapid heartbeat because of panic?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 157, localId: 5, text: 'How much did panic attacks interfere with work or responsibilities?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 158, localId: 6, text: 'How much did panic attacks interfere with social life?', type: 'scale', options: FREQUENCY_SCALE },

];



// Stress questionnaire (PSS, items 174-183)
const STRESS_QUESTIONS: Question[] = [
  { id: 159, localId: 0, text: 'Been upset because of something that happened unexpectedly?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 160, localId: 1, text: 'Felt unable to control important things in your life?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 161, localId: 2, text: 'Felt nervous and stressed?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 162, localId: 3, text: 'Felt confident about ability to handle personal problems?', type: 'scale', options: FREQUENCY_SCALE, isReversed: true },
  { id: 163, localId: 4, text: 'Felt things were going your way?', type: 'scale', options: FREQUENCY_SCALE, isReversed: true },
  { id: 164, localId: 5, text: 'Found that you could not cope with all things to do?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 165, localId: 6, text: 'Been able to control irritations in your life?', type: 'scale', options: FREQUENCY_SCALE, isReversed: true },
  { id: 166, localId: 7, text: 'Felt that you were on top of things?', type: 'scale', options: FREQUENCY_SCALE, isReversed: true },
  { id: 167, localId: 8, text: 'Been angered because of things outside your control?', type: 'scale', options: FREQUENCY_SCALE },
  { id: 168, localId: 9, text: 'Felt difficulties were piling up so high you could not overcome them?', type: 'scale', options: FREQUENCY_SCALE },

];

// Social Anxiety questionnaire (SPIN, items 184-200)
const SOCIAL_ANXIETY_QUESTIONS: Question[] = [
  { id: 169, localId: 0, text: 'Afraid of people in authority', type: 'scale', options: FREQUENCY_SCALE },
  { id: 170, localId: 1, text: 'Bothered by blushing in front of people', type: 'scale', options: FREQUENCY_SCALE },
  { id: 171, localId: 2, text: 'Parties and social events scare you', type: 'scale', options: FREQUENCY_SCALE },
  { id: 172, localId: 3, text: 'Avoid talking to people you don\'t know', type: 'scale', options: FREQUENCY_SCALE },
  { id: 173, localId: 4, text: 'Being criticized scares you a lot', type: 'scale', options: FREQUENCY_SCALE },
  { id: 174, localId: 5, text: 'Avoid doing things or speaking to people for fear of embarrassment', type: 'scale', options: FREQUENCY_SCALE },
  { id: 175, localId: 6, text: 'Sweating in front of people causes distress', type: 'scale', options: FREQUENCY_SCALE },
  { id: 176, localId: 7, text: 'Avoid going to parties', type: 'scale', options: FREQUENCY_SCALE },
  { id: 177, localId: 8, text: 'Avoid activities in which you are the center of attention', type: 'scale', options: FREQUENCY_SCALE },
  { id: 178, localId: 9, text: 'Talking to strangers scares you', type: 'scale', options: FREQUENCY_SCALE },
  { id: 179, localId: 10, text: 'Avoid having to give speeches', type: 'scale', options: FREQUENCY_SCALE },
  { id: 180, localId: 11, text: 'Would do anything to avoid being criticized', type: 'scale', options: FREQUENCY_SCALE },
  { id: 181, localId: 12, text: 'Heart palpitations bother you when around people', type: 'scale', options: FREQUENCY_SCALE },
  { id: 182, localId: 13, text: 'Afraid of doing things when people might be watching', type: 'scale', options: FREQUENCY_SCALE },
  { id: 183, localId: 14, text: 'Being embarrassed or looking stupid is your worst fear', type: 'scale', options: FREQUENCY_SCALE },
  { id: 184, localId: 15, text: 'Avoid speaking to anyone in authority', type: 'scale', options: FREQUENCY_SCALE },
  { id: 185, localId: 16, text: 'Trembling or shaking in front of others is distressing', type: 'scale', options: FREQUENCY_SCALE },

];

// Complete questionnaire metadata mapping
export const QUESTIONNAIRES: Record<string, QuestionnaireMetadata> = {
  'Depression': {
    name: 'Depression',
    shortName: 'PHQ-9',
    description: 'Patient Health Questionnaire assessing depressive symptoms',
    startIndex: 0,
    endIndex: 8,
    itemCount: 9,
    questions: DEPRESSION_QUESTIONS,
  },
  'ADD / ADHD': {
    name: 'ADD / ADHD',
    shortName: 'ASRS',
    description: 'Adult ADHD Self-Report Scale for attention deficit and hyperactivity symptoms',
    startIndex: 9,
    endIndex: 26,
    itemCount: 18,
    questions: ADHD_QUESTIONS,
  },
  'Substance or Alcohol Use Issues': {
    name: 'Substance or Alcohol Use Issues',
    shortName: 'AUDIT',
    description: 'Alcohol Use Disorders Identification Test',
    startIndex: 27,
    endIndex: 36,
    itemCount: 10,
    questions: ALCOHOL_QUESTIONS,
  },
  'Binge eating / Eating disorders': {
    name: 'Binge eating / Eating disorders',
    shortName: 'BES',
    description: 'Binge Eating Scale for eating disorder symptoms',
    startIndex: 37,
    endIndex: 52,
    itemCount: 16,
    questions: EATING_DISORDER_QUESTIONS,
  },
  'Drug Abuse': {
    name: 'Drug Abuse',
    shortName: 'DAST-10',
    description: 'Drug Abuse Screening Test',
    startIndex: 53,
    endIndex: 62,
    itemCount: 10,
    questions: DRUG_ABUSE_QUESTIONS,
  },
  'Anxiety': {
    name: 'Anxiety',
    shortName: 'GAD-7',
    description: 'Generalized Anxiety Disorder 7-item scale',
    startIndex: 63,
    endIndex: 69,
    itemCount: 7,
    questions: ANXIETY_QUESTIONS,
  },
  'Insomnia': {
    name: 'Insomnia',
    shortName: 'ISI',
    description: 'Insomnia Severity Index',
    startIndex: 70,
    endIndex: 76,
    itemCount: 7,
    questions: INSOMNIA_QUESTIONS,
  },
  'Burnout': {
    name: 'Burnout',
    shortName: 'MBI',
    description: 'Maslach Burnout Inventory',
    startIndex: 77,
    endIndex: 98,
    itemCount: 22,
    questions: BURNOUT_QUESTIONS,
  },
  'Bipolar disorder (BD)': {
    name: 'Bipolar disorder (BD)',
    shortName: 'MDQ',
    description: 'Mood Disorder Questionnaire for bipolar symptoms',
    startIndex: 99,
    endIndex: 113,
    itemCount: 15,
    questions: BIPOLAR_QUESTIONS,
  },
  'Obsessive compulsive disorder (OCD)': {
    name: 'Obsessive compulsive disorder (OCD)',
    shortName: 'OCI-R',
    description: 'Obsessive-Compulsive Inventory-Revised',
    startIndex: 114,
    endIndex: 131,
    itemCount: 18,
    questions: OCD_QUESTIONS,
  },
  'Post-traumatic stress disorder (PTSD)': {
    name: 'Post-traumatic stress disorder (PTSD)',
    shortName: 'PCL-5',
    description: 'PTSD Checklist for DSM-5',
    startIndex: 132,
    endIndex: 151,
    itemCount: 20,
    questions: PTSD_QUESTIONS,
  },
  'Panic': {
    name: 'Panic',
    shortName: 'PDSS',
    description: 'Panic Disorder Severity Scale',
    startIndex: 152,
    endIndex: 158,
    itemCount: 7,
    questions: PANIC_QUESTIONS,
  },
  'Stress': {
    name: 'Stress',
    shortName: 'PSS',
    description: 'Perceived Stress Scale',
    startIndex: 159,
    endIndex: 168,
    itemCount: 10,
    questions: STRESS_QUESTIONS,
  },
  'Social anxiety': {
    name: 'Social anxiety',
    shortName: 'SPIN',
    description: 'Social Phobia Inventory',
    startIndex: 169,
    endIndex: 185,
    itemCount: 17,
    questions: SOCIAL_ANXIETY_QUESTIONS,
  },
};

// Note: "Phobia" questionnaire is not explicitly defined in the 201-item structure
// It may need to be mapped to existing questions or added separately

// Helper function to get questionnaire by name
export function getQuestionnaireByName(name: string): QuestionnaireMetadata | undefined {
  return QUESTIONNAIRES[name];
}

// Helper function to get all questionnaire names
export function getAllQuestionnaireNames(): string[] {
  return Object.keys(QUESTIONNAIRES);
}

// Helper function to get question by global ID
export function getQuestionById(id: number): Question | undefined {
  for (const questionnaire of Object.values(QUESTIONNAIRES)) {
    const question = questionnaire.questions.find(q => q.id === id);
    if (question) {
      return question;
    }
  }
  return undefined;
}

// Validate that we have 201 questions total
const totalQuestions = Object.values(QUESTIONNAIRES).reduce(
  (sum, q) => sum + q.itemCount,
  0,
);
if (totalQuestions !== 186) {
  console.warn(`Warning: Expected 196 questions, but have ${totalQuestions}. Missing Phobia questionnaire (10 items).`);
}

