// Worksheets Seed Module
// Handles creation of therapy worksheets, materials, and client submissions

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedWorksheets(
  prisma: PrismaClient,
  relationships: any[]
) {
  console.log('📝 Creating worksheets and submissions...');

  const worksheets: any[] = [];
  const materials: any[] = [];
  const submissions: any[] = [];

  // Worksheet templates for different therapy types
  const worksheetTemplates = [
    {
      title: 'Mood Tracking Diary',
      instructions: 'Track your mood daily for the next week. Note what activities, thoughts, or events influence your emotional state.',
      description: 'A structured diary to help identify mood patterns and triggers.',
      type: 'mood-tracking',
    },
    {
      title: 'Cognitive Behavioral Thought Record',
      instructions: 'When you notice negative thoughts, write them down along with the situation, feelings, and alternative perspectives.',
      description: 'CBT exercise to challenge negative thinking patterns.',
      type: 'cbt',
    },
    {
      title: 'Gratitude Journal',
      instructions: 'Write down 3 things you are grateful for each day. Be specific about why you appreciate each item.',
      description: 'Daily practice to cultivate positive thinking and appreciation.',
      type: 'mindfulness',
    },
    {
      title: 'Anxiety Coping Strategies Plan',
      instructions: 'Identify your anxiety triggers and develop specific coping strategies for each situation.',
      description: 'Personalized toolkit for managing anxiety in different contexts.',
      type: 'anxiety',
    },
    {
      title: 'Daily Activity Schedule',
      instructions: 'Plan your daily activities including self-care, work, and leisure. Rate your mood and energy after each activity.',
      description: 'Behavioral activation tool to increase engagement in meaningful activities.',
      type: 'behavioral-activation',
    },
    {
      title: 'Sleep Hygiene Assessment',
      instructions: 'Track your sleep patterns and bedtime routine for one week. Note factors that help or hinder your sleep.',
      description: 'Evaluation of sleep habits to improve rest quality.',
      type: 'sleep',
    },
    {
      title: 'Values Exploration Exercise',
      instructions: 'Identify your core values and reflect on how your current life aligns with what matters most to you.',
      description: 'Clarification exercise to guide decision-making and goal-setting.',
      type: 'values',
    },
    {
      title: 'Communication Skills Practice',
      instructions: 'Practice assertive communication by writing out responses to challenging interpersonal situations.',
      description: 'Development of healthy communication patterns and boundaries.',
      type: 'communication',
    },
    {
      title: 'Mindfulness Meditation Log',
      instructions: 'Practice mindfulness meditation for 10 minutes daily. Record your experience and any insights.',
      description: 'Structured introduction to mindfulness practice.',
      type: 'mindfulness',
    },
    {
      title: 'Relapse Prevention Plan',
      instructions: 'Identify warning signs and develop strategies to maintain your progress and prevent setbacks.',
      description: 'Comprehensive plan for sustaining positive changes.',
      type: 'relapse-prevention',
    },
  ];

  // Create worksheets for each client-therapist relationship
  for (const { relationship, client, therapist } of relationships) {
    try {
      // Create 2-5 worksheets per relationship
      const worksheetCount = faker.number.int({ min: 2, max: 5 });
      const selectedTemplates = faker.helpers.arrayElements(worksheetTemplates, worksheetCount);

      for (const template of selectedTemplates) {
        // Determine worksheet timing and status
        const assignedDate = faker.date.between({
          from: relationship.assignedAt,
          to: new Date(),
        });
        
        const dueDate = faker.date.future({
          years: 0.1,
          refDate: assignedDate,
        });

        const isOverdue = dueDate < new Date();
        const isCompleted = faker.datatype.boolean({ 
          probability: isOverdue ? 0.7 : 0.4 
        });

        let status: string;
        if (isCompleted) {
          status = 'completed';
        } else if (isOverdue) {
          status = 'past_due';
        } else if (faker.datatype.boolean({ probability: 0.6 })) {
          status = 'assigned';
        } else {
          status = 'upcoming';
        }

        // Create worksheet
        const worksheet = await prisma.worksheet.create({
          data: {
            clientId: client.user.id,
            therapistId: therapist.user.id,
            title: template.title,
            instructions: template.instructions,
            description: template.description,
            dueDate,
            status,
            isCompleted,
            submittedAt: isCompleted ? faker.date.between({
              from: assignedDate,
              to: dueDate,
            }) : null,
            feedback: isCompleted && faker.datatype.boolean({ probability: 0.8 }) 
              ? generateTherapistFeedback() 
              : null,
            createdAt: assignedDate,
          },
        });
        worksheets.push(worksheet);

        // Create worksheet materials (therapist attachments)
        if (faker.datatype.boolean({ probability: 0.6 })) {
          const materialCount = faker.number.int({ min: 1, max: 3 });
          for (let i = 0; i < materialCount; i++) {
            const material = await prisma.worksheetMaterial.create({
              data: {
                worksheetId: worksheet.id,
                filename: generateMaterialFilename(template.type),
                url: faker.internet.url() + '/materials/' + faker.string.uuid() + '.pdf',
                fileSize: faker.number.int({ min: 100000, max: 2000000 }),
                fileType: 'application/pdf',
              },
            });
            materials.push(material);
          }
        }

        // Create client submissions for completed/assigned worksheets
        if (status === 'completed' || (status === 'assigned' && faker.datatype.boolean({ probability: 0.4 }))) {
          const submissionCount = faker.number.int({ min: 1, max: 2 });
          for (let i = 0; i < submissionCount; i++) {
            const submission = await prisma.worksheetSubmission.create({
              data: {
                worksheetId: worksheet.id,
                clientId: client.user.id,
                filename: `${template.title.toLowerCase().replace(/\s+/g, '_')}_submission_${i + 1}.pdf`,
                url: faker.internet.url() + '/submissions/' + faker.string.uuid() + '.pdf',
                fileSize: faker.number.int({ min: 50000, max: 1000000 }),
                fileType: 'application/pdf',
                content: generateSubmissionContent(template.type),
                createdAt: faker.date.between({
                  from: assignedDate,
                  to: worksheet.submittedAt || new Date(),
                }),
              },
            });
            submissions.push(submission);
          }
        }
      }

      console.log(
        `✅ Created ${worksheetCount} worksheets for ${client.user.firstName} with ${therapist.user.firstName}`
      );
    } catch (error) {
      console.error(
        `Failed to create worksheets for ${client.user.firstName} and ${therapist.user.firstName}:`,
        error
      );
    }
  }

  console.log(`📊 Worksheet creation summary:`);
  console.log(`   📝 Total worksheets: ${worksheets.length}`);
  console.log(`   📎 Total materials: ${materials.length}`);
  console.log(`   📄 Total submissions: ${submissions.length}`);
  console.log(`   ✅ Completed: ${worksheets.filter(w => w.isCompleted).length}`);
  console.log(`   ⏰ Past due: ${worksheets.filter(w => w.status === 'past_due').length}`);
  console.log(`   📋 Assigned: ${worksheets.filter(w => w.status === 'assigned').length}`);
  console.log(`   🔜 Upcoming: ${worksheets.filter(w => w.status === 'upcoming').length}`);

  return { worksheets, materials, submissions };
}

function generateMaterialFilename(worksheetType: string): string {
  const materialTypes = {
    'mood-tracking': [
      'mood_tracking_template.pdf',
      'emotional_awareness_guide.pdf',
      'mood_chart_example.pdf',
    ],
    'cbt': [
      'thought_record_template.pdf',
      'cognitive_distortions_guide.pdf',
      'cbt_techniques_overview.pdf',
    ],
    'mindfulness': [
      'mindfulness_exercises.pdf',
      'gratitude_journal_template.pdf',
      'meditation_guide.pdf',
    ],
    'anxiety': [
      'anxiety_management_strategies.pdf',
      'breathing_exercises.pdf',
      'exposure_therapy_guide.pdf',
    ],
    'behavioral-activation': [
      'activity_scheduling_template.pdf',
      'pleasant_activities_list.pdf',
      'energy_mood_tracker.pdf',
    ],
    'sleep': [
      'sleep_hygiene_checklist.pdf',
      'sleep_diary_template.pdf',
      'relaxation_techniques.pdf',
    ],
    'values': [
      'values_assessment_tool.pdf',
      'life_wheel_exercise.pdf',
      'goal_setting_worksheet.pdf',
    ],
    'communication': [
      'assertiveness_techniques.pdf',
      'conflict_resolution_guide.pdf',
      'boundary_setting_worksheet.pdf',
    ],
    'relapse-prevention': [
      'warning_signs_checklist.pdf',
      'coping_strategies_plan.pdf',
      'support_network_map.pdf',
    ],
  };

  const defaultMaterials = [
    'therapy_worksheet.pdf',
    'exercise_instructions.pdf',
    'reference_material.pdf',
  ];

  const materials = materialTypes[worksheetType] || defaultMaterials;
  return faker.helpers.arrayElement(materials);
}

function generateSubmissionContent(worksheetType: string): string {
  const submissionContent = {
    'mood-tracking': [
      'Day 1: Mood 7/10, felt anxious before work meeting but better after talking with friend.\nDay 2: Mood 5/10, had trouble sleeping, noticed negative thoughts about upcoming deadline.\nDay 3: Mood 8/10, exercise in morning really helped, felt more positive throughout day.',
      'This week I noticed my mood is lowest in the mornings and improves after I have coffee and check my schedule. Exercise consistently improves my mood by 2-3 points.',
    ],
    'cbt': [
      'Situation: Boss gave critical feedback\nThought: "I\'m terrible at my job"\nFeeling: Shame, anxiety\nAlternative thought: "This is one piece of feedback that I can learn from"',
      'I\'ve been practicing catching negative thoughts and challenging them. It\'s getting easier to recognize when I\'m catastrophizing.',
    ],
    'mindfulness': [
      'Today I\'m grateful for: 1) My supportive friend who listened when I needed to talk, 2) The beautiful sunset I noticed on my walk, 3) Having a comfortable home to return to each day.',
      'Meditation Day 5: Found it easier to focus on my breath today. When thoughts came up, I was able to notice them without judgment and return to breathing.',
    ],
    'anxiety': [
      'Trigger: Social gatherings\nPhysical symptoms: Racing heart, sweating\nCoping strategy: Deep breathing, positive self-talk\nOutcome: Was able to stay at the party for 2 hours',
      'I\'ve identified that uncertainty is my biggest anxiety trigger. I\'m working on accepting that I can\'t control everything.',
    ],
    'behavioral-activation': [
      '9 AM - Morning walk (Energy: 6, Mood: 7)\n11 AM - Work tasks (Energy: 7, Mood: 6)\n2 PM - Lunch with colleague (Energy: 8, Mood: 8)\n6 PM - Cooking dinner (Energy: 5, Mood: 7)',
      'I notice that social activities and being outside consistently improve both my energy and mood.',
    ],
    'sleep': [
      'Bedtime: 11:30 PM, Fall asleep: 12:15 AM, Wake up: 7:00 AM\nScreen time before bed: 45 minutes (need to reduce this)\nRoom temperature: Good, Caffeine: Last cup at 2 PM',
      'I\'ve been working on reducing screen time before bed and it\'s helping me fall asleep faster.',
    ],
    'values': [
      'My core values: Family, creativity, helping others, personal growth\nCurrent life alignment: Strong with family (8/10), creativity needs work (4/10), helping others through volunteer work (7/10)',
      'I realize I need to make more time for creative pursuits. This is important for my sense of fulfillment.',
    ],
    'communication': [
      'Situation: Roommate not cleaning shared spaces\nAssertive response: "I\'d like to talk about keeping our common areas clean. Can we agree on a schedule?"\nOutcome: We created a cleaning schedule that works for both of us.',
      'I\'m getting better at expressing my needs without being aggressive or passive. It feels good to advocate for myself.',
    ],
    'relapse-prevention': [
      'Warning signs: Isolating from friends, skipping therapy appointments, negative self-talk increasing\nCoping strategies: Reach out to support person, increase therapy frequency, practice mindfulness\nSupport network: Therapist, best friend, sister, support group',
      'I feel more confident about maintaining my progress now that I have a clear plan for handling setbacks.',
    ],
  };

  const defaultContent = [
    'I found this exercise helpful in understanding my patterns and reactions.',
    'This worksheet helped me gain new insights about myself and my situation.',
    'I\'m starting to see connections between my thoughts, feelings, and behaviors.',
  ];

  const content = submissionContent[worksheetType] || defaultContent;
  return faker.helpers.arrayElement(content);
}

function generateTherapistFeedback(): string {
  const feedbackOptions = [
    'Excellent work on this assignment! I can see you\'re really engaging with the material and gaining valuable insights.',
    'Great job completing this worksheet. Your self-awareness is developing nicely. Let\'s discuss this further in our next session.',
    'Thank you for your thoughtful responses. I notice you\'re becoming more skilled at identifying patterns in your thoughts and behaviors.',
    'Your commitment to completing these exercises is commendable. I can see progress in how you\'re processing these concepts.',
    'Well done! Your insights show real growth. Consider how you might apply these strategies in other areas of your life.',
    'I appreciate the effort you put into this assignment. Your reflections demonstrate increased emotional awareness.',
    'Good progress! I\'d like to explore some of the themes you\'ve identified here during our next meeting.',
    'Your responses show that you\'re developing effective coping strategies. Keep up the excellent work!',
    'Thank you for being so open and honest in your responses. This level of self-reflection will serve you well.',
    'I can see you\'re really integrating the concepts we\'ve discussed. Let\'s build on this foundation in future sessions.',
  ];

  return faker.helpers.arrayElement(feedbackOptions);
}