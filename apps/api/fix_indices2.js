const fs = require('fs');

const metaBlocks = [
    { key: "'Depression'", count: 9 }, // 0-8
    { key: "'ADD / ADHD'", count: 18 }, // 9-26
    { key: "'Substance or Alcohol Use Issues'", count: 10 }, // 27-36
    { key: "'Binge eating / Eating disorders'", count: 16 }, // 37-52
    { key: "'Drug Abuse'", count: 10, tsKey: "'Drug Issues'" }, // 53-62  Note: utils uses 'Drug Issues', consts uses 'Drug Abuse'
    { key: "'Anxiety'", count: 7 }, // 63-69
    { key: "'Insomnia'", count: 7 }, // 70-76
    { key: "'Burnout'", count: 22 }, // 77-98
    { key: "'Bipolar disorder (BD)'", count: 15 }, // 99-113
    { key: "'Obsessive compulsive disorder (OCD)'", count: 18 }, // 114-131
    { key: "'Post-traumatic stress disorder (PTSD)'", count: 20 }, // 132-151
    { key: "'Panic'", count: 7 }, // 152-158
    { key: "'Stress'", count: 10 }, // 159-168
    { key: "'Social anxiety'", count: 17 } // 169-185
];

// --- Fix pre-assessment.utils.ts ---
let utilsFile = fs.readFileSync('src/pre-assessment/pre-assessment.utils.ts', 'utf8');

// The block to replace:
const targetBlockRegex = /const QUESTIONNAIRE_INDEX_MAPPING: Record<string, QuestionnaireIndexRange> = \{([\s\S]*?)\};/;

let newMappingLines = [];
let currentId = 0;
metaBlocks.forEach(meta => {
    const tsKey = meta.tsKey || meta.key; // Drug Issues vs Drug Abuse
    const start = currentId;
    const end = currentId + meta.count - 1;
    // keep the key unquoted if it's alphanumeric without spaces, else quoted
    const formattedKey = tsKey.replace(/'/g, '').includes(' ') ? tsKey : tsKey.replace(/'/g, '');
    newMappingLines.push(`  ${formattedKey}: { startIndex: ${start}, endIndex: ${end}, itemCount: ${meta.count} },`);
    currentId += meta.count;
});

const newBlockStr = `const QUESTIONNAIRE_INDEX_MAPPING: Record<string, QuestionnaireIndexRange> = {\n${newMappingLines.join('\n')}\n};`;
utilsFile = utilsFile.replace(targetBlockRegex, newBlockStr);

// Also need to fix the calculateAllScoresFromFlatArray where it expects exactly 201 items
utilsFile = utilsFile.replace(/if \(flatAnswers\.length !== 201\) \{/, `if (flatAnswers.length !== 186) {`);
utilsFile = utilsFile.replace(/Expected 201 responses, got \$\{flatAnswers\.length\}/, `Expected 186 responses, got \${flatAnswers.length}`);

fs.writeFileSync('src/pre-assessment/pre-assessment.utils.ts', utilsFile);


// --- Fix questionnaires.ts ---
let qsFile = fs.readFileSync('src/constants/questionnaires.ts', 'utf8');

// For each block, find the string between key: { and },
currentId = 0;
metaBlocks.forEach(meta => {
    const keyMatch = qsFile.indexOf(meta.key + ': {');
    if (keyMatch !== -1) {
        const endMatch = qsFile.indexOf('},', keyMatch);
        if (endMatch !== -1) {
            let block = qsFile.substring(keyMatch, endMatch + 2);
            block = block.replace(/startIndex:\s*\d+/, `startIndex: ${currentId}`);
            block = block.replace(/endIndex:\s*\d+/, `endIndex: ${currentId + meta.count - 1}`);
            block = block.replace(/itemCount:\s*\d+/, `itemCount: ${meta.count}`);
            qsFile = qsFile.substring(0, keyMatch) + block + qsFile.substring(endMatch + 2);
        }
    }
    currentId += meta.count;
});

qsFile = qsFile.replace(/if \(totalQuestions !== \d+\) \{/, `if (totalQuestions !== 186) {`);
qsFile = qsFile.replace(/Expected \d+ questions, but have \$\{totalQuestions\}\. Missing Phobia questionnaire \(10 items\)\./, `Expected 196 questions, but have \${totalQuestions}. Missing Phobia questionnaire (10 items).`);

fs.writeFileSync('src/constants/questionnaires.ts', qsFile);

console.log('Fixed indices in both files.');
