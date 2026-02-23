const fs = require('fs');
const file = fs.readFileSync('src/constants/questionnaires.ts', 'utf8');

let newFile = file.replace(/const DEPRESSION_QUESTIONS: Question\[\] = \[[\s\S]*?\];/, `const DEPRESSION_QUESTIONS: Question[] = [
  { id: 0, localId: 0, text: 'Little interest or pleasure in doing things', type: 'scale', options: SCALE_0_4 },
  { id: 1, localId: 1, text: 'Feeling down, depressed, or hopeless', type: 'scale', options: SCALE_0_4 },
  { id: 2, localId: 2, text: 'Trouble falling or staying asleep, or sleeping too much', type: 'scale', options: SCALE_0_4 },
  { id: 3, localId: 3, text: 'Feeling tired or having little energy', type: 'scale', options: SCALE_0_4 },
  { id: 4, localId: 4, text: 'Poor appetite or overeating', type: 'scale', options: SCALE_0_4 },
  { id: 5, localId: 5, text: 'Feeling bad about yourself or that you are a failure', type: 'scale', options: SCALE_0_4 },
  { id: 6, localId: 6, text: 'Trouble concentrating on things like reading or watching TV', type: 'scale', options: SCALE_0_4 },
  { id: 7, localId: 7, text: 'Moving or speaking slowly, or being fidgety or restless', type: 'scale', options: SCALE_0_4 },
  { id: 8, localId: 8, text: 'Thoughts that you would be better off dead or hurting yourself', type: 'scale', options: SCALE_0_4 },
];`);

newFile = newFile.replace(/\/\/ Depression Secondary questionnaire \(PHQ-9, items 165-173\)[\s\S]*?\];/, '');

// Now we need to recalculate all IDs
let currentGlobalId = 0;
const blocks = [
    'DEPRESSION_QUESTIONS', 'ADHD_QUESTIONS', 'ALCOHOL_QUESTIONS', 'EATING_DISORDER_QUESTIONS',
    'DRUG_ABUSE_QUESTIONS', 'ANXIETY_QUESTIONS', 'INSOMNIA_QUESTIONS', 'BURNOUT_QUESTIONS',
    'BIPOLAR_QUESTIONS', 'OCD_QUESTIONS', 'PTSD_QUESTIONS', 'PANIC_QUESTIONS',
    'STRESS_QUESTIONS', 'SOCIAL_ANXIETY_QUESTIONS'
];

blocks.forEach(block => {
    const regex = new RegExp(`const ${block}: Question\\[\\] = \\[([\\s\\S]*?)\\];`);
    const match = newFile.match(regex);
    if (match) {
        let replacedLines = [];
        const lines = match[1].split('\n');
        let localId = 0;
        lines.forEach(line => {
            if (line.includes('{ id:')) {
                let newLine = line.replace(/id:\s*\d+/, `id: ${currentGlobalId}`);
                newLine = newLine.replace(/localId:\s*\d+/, `localId: ${localId}`);
                replacedLines.push(newLine);
                currentGlobalId++;
                localId++;
            } else {
                replacedLines.push(line);
            }
        });
        newFile = newFile.replace(match[0], `const ${block}: Question[] = [${replacedLines.join('\n')}\n];`);
    }
});

// Update QUESTIONNAIRES metadata block
let currentMetaId = 0;
const mapRegex = /export const QUESTIONNAIRES[\s\S]*?\n\};/g;
const mapMatchArr = newFile.match(mapRegex);
if (!mapMatchArr) throw new Error("Could not find QUESTIONNAIRES export");
let mapMatch = mapMatchArr[0];

const metaBlocks = [
    { key: "'Depression'", sn: 'PHQ-9', d: 'Patient Health Questionnaire assessing depressive symptoms', count: 9 },
    { key: "'ADD / ADHD'", sn: 'ASRS', count: 18 },
    { key: "'Substance or Alcohol Use Issues'", sn: 'AUDIT', count: 10 },
    { key: "'Binge eating / Eating disorders'", sn: 'BES', count: 16 },
    { key: "'Drug Abuse'", sn: 'DAST-10', count: 10 },
    { key: "'Anxiety'", sn: 'GAD-7', count: 7 },
    { key: "'Insomnia'", sn: 'ISI', count: 7 },
    { key: "'Burnout'", sn: 'MBI', count: 22 },
    { key: "'Bipolar disorder (BD)'", sn: 'MDQ', count: 15 },
    { key: "'Obsessive compulsive disorder (OCD)'", sn: 'OCI-R', count: 18 },
    { key: "'Post-traumatic stress disorder (PTSD)'", sn: 'PCL-5', count: 20 },
    { key: "'Panic'", sn: 'PDSS', count: 7 },
    { key: "'Stress'", sn: 'PSS', count: 10 },
    { key: "'Social anxiety'", sn: 'SPIN', count: 17 }
];

metaBlocks.forEach(meta => {
    // Use a softer regex to match keys that might or might not have quotes
    const keyForm1 = meta.key;
    const keyForm2 = meta.key.replace(/'/g, '');
    const blockRegex = new RegExp(`(?:${keyForm1}|${keyForm2}): \\{[\\s\\S]*?\\},`);
    const match = mapMatch.match(blockRegex);
    if (match) {
        let str = match[0];
        str = str.replace(/startIndex:\s*\d+/, `startIndex: ${currentMetaId}`);
        str = str.replace(/endIndex:\s*\d+/, `endIndex: ${currentMetaId + meta.count - 1}`);
        str = str.replace(/itemCount:\s*\d+/, `itemCount: ${meta.count}`);
        if (meta.d) str = str.replace(/description: '.*?'/, `description: '${meta.d}'`);
        if (meta.sn) str = str.replace(/shortName: '.*?'/, `shortName: '${meta.sn}'`);

        mapMatch = mapMatch.replace(match[0], str);
        currentMetaId += meta.count;
    }
});

// Remove unused 'Depression Secondary' from QUESTIONNAIRES metadata
mapMatch = mapMatch.replace(/  'Depression Secondary': \{[\s\S]*?\},/, '');
newFile = newFile.replace(mapRegex, mapMatch);

// Update total validation count
const expectedTotal = currentMetaId; // should be 185
newFile = newFile.replace(/if \(totalQuestions !== 191\) \{/, `if (totalQuestions !== ${expectedTotal}) {`);
newFile = newFile.replace(/Expected 201 questions, but have \$\{totalQuestions\}\. Missing Phobia questionnaire \(10 items\)\./, `Expected ${expectedTotal + 10} questions, but have \${totalQuestions}. Missing Phobia questionnaire (10 items).`);

fs.writeFileSync('src/constants/questionnaires.ts', newFile);
console.log('Update complete. Total items: ' + currentGlobalId);
