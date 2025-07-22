// Community Content Seed Module
// Handles creation of realistic posts, comments, and hearts across community rooms

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { SEED_CONFIG } from './config';

// Mental health focused post templates organized by room type
const POST_TEMPLATES = {
  'Welcome': [
    {
      title: 'Welcome to our community! 🌟',
      content: 'Welcome to our supportive community! This is a safe space where we can share our experiences, support each other, and grow together. Please take a moment to read our community guidelines and introduce yourself when you feel comfortable.',
    },
    {
      title: 'New member introduction thread',
      content: 'Hi everyone! Feel free to introduce yourself here when you\'re ready. Share as much or as little as you\'d like - we\'re just happy to have you here.',
    },
  ],
  'Announcements': [
    {
      title: 'New Mental Health Resources Available',
      content: 'We\'ve added new resources to our community library including guided meditations, crisis hotlines, and self-care worksheets. Check out the pinned resources in our Helpful Resources room.',
    },
    {
      title: 'Weekly Check-in Thread Schedule',
      content: 'Join us for our weekly community check-ins every Monday at 7 PM EST. These are informal gatherings where we can share how we\'re doing and support each other through the week ahead.',
    },
  ],
  'Community Guidelines': [
    {
      title: 'Community Guidelines - Please Read',
      content: 'Our community guidelines ensure a safe and supportive environment for everyone:\n\n1. Treat everyone with kindness and respect\n2. No medical advice - always consult professionals\n3. Respect privacy - no personal information sharing\n4. Use content warnings for sensitive topics\n5. Support rather than give advice unless asked\n\nTogether we can create a healing space for all.',
    },
  ],
  'General Chat': [
    {
      title: 'How is everyone doing today?',
      content: 'Just wanted to check in with everyone. Some days are harder than others, and I\'m having one of those days. How are you all managing today?',
    },
    {
      title: 'Small wins deserve celebration too 🎉',
      content: 'I managed to get out of bed, shower, and make myself breakfast today. It might not seem like much, but for me right now, it feels like a huge accomplishment. What small wins have you had lately?',
    },
    {
      title: 'Feeling grateful for this community',
      content: 'I\'ve been part of this community for a few months now, and I can\'t express how much it means to have a safe space to share and connect with people who understand. Thank you all for being here.',
    },
    {
      title: 'Anyone else struggling with seasonal changes?',
      content: 'The shorter days are really affecting my mood. I know it\'s normal, but it still catches me off guard every year. How do you all cope with seasonal mood changes?',
    },
  ],
  'Share Your Story': [
    {
      title: 'My journey with therapy - 1 year update',
      content: 'It\'s been a year since I started therapy, and I wanted to share my experience. The beginning was scary and uncomfortable, but having a safe space to process my thoughts has been life-changing. To anyone considering therapy - it\'s okay to be nervous, and it\'s okay to take your time finding the right therapist.',
    },
    {
      title: 'Learning to set boundaries changed my life',
      content: 'For years I was a people pleaser and couldn\'t say no to anyone. Learning to set healthy boundaries was one of the hardest but most important things I\'ve done for my mental health. It\'s still a work in progress, but I\'m getting there.',
    },
    {
      title: 'From daily panic attacks to finding peace',
      content: 'Two years ago I was having panic attacks daily. Today I can say that while I still have anxiety, I have tools to manage it and days where I feel truly at peace. Recovery isn\'t linear, but progress is possible.',
    },
  ],
  'Daily Check-ins': [
    {
      title: 'Monday Check-in: Setting intentions for the week',
      content: 'Starting the week with some self-compassion. My intention is to be gentle with myself and celebrate small victories. What are your intentions for this week?',
    },
    {
      title: 'Midweek check-in: How are we holding up?',
      content: 'Wednesday energy check! Some days feel harder than others. Remember that it\'s okay to rest, it\'s okay to struggle, and it\'s okay to ask for help. How are you all doing today?',
    },
    {
      title: 'Friday reflection: What are you grateful for?',
      content: 'Ending the week with gratitude. I\'m grateful for my morning coffee, a text from a friend, and the sunset I saw on my walk today. What small things brought you joy this week?',
    },
  ],
  'Ask for Help': [
    {
      title: 'Struggling with sleep - any tips?',
      content: 'My sleep schedule is all over the place and it\'s affecting everything else. I\'ve tried the usual advice but nothing seems to stick. Has anyone found techniques that really work for them?',
    },
    {
      title: 'How do you handle overwhelming days?',
      content: 'Some days everything feels like too much. Work, responsibilities, even small tasks feel overwhelming. I know I\'m not alone in this - how do you all cope when everything feels like too much?',
    },
    {
      title: 'Advice for talking to family about mental health?',
      content: 'I want to open up to my family about what I\'ve been going through, but I\'m scared they won\'t understand or will minimize my experience. Has anyone navigated this conversation successfully?',
    },
  ],
  'Success Stories': [
    {
      title: 'Celebrated 6 months anxiety-free today! 🎉',
      content: 'Six months ago I couldn\'t leave my house without having a panic attack. Today I went to a coffee shop, had lunch with a friend, and even tried a new hiking trail. The work was hard, but recovery is possible!',
    },
    {
      title: 'Finally found a medication that works',
      content: 'After trying several different medications and dealing with side effects, my doctor and I found one that actually helps without major side effects. Don\'t give up if the first (or second, or third) doesn\'t work for you.',
    },
    {
      title: 'Started my dream job despite my mental health challenges',
      content: 'I almost didn\'t apply because I was convinced my anxiety and depression would hold me back. But I got the job and my new workplace is actually very supportive of mental health. Sometimes the fear is worse than reality.',
    },
  ],
  'Helpful Resources': [
    {
      title: 'Crisis resources and hotlines',
      content: 'Important crisis resources:\n\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n• SAMHSA Helpline: 1-800-662-HELP\n• International Crisis Lines: https://findahelpline.com\n\nRemember: You are not alone, and help is always available.',
    },
    {
      title: 'Free meditation and mindfulness apps',
      content: 'Some great free resources for meditation and mindfulness:\n\n• Insight Timer (free meditations)\n• UCLA Mindful app\n• Headspace (limited free content)\n• Calm (some free content)\n• YouTube guided meditations\n\nMindfulness isn\'t a cure-all, but it can be a helpful tool in your toolkit.',
    },
    {
      title: 'Self-care ideas that actually help',
      content: 'Self-care doesn\'t have to be expensive or time-consuming:\n\n• Take 3 deep breaths\n• Step outside for 5 minutes\n• Drink a glass of water\n• Text a friend\n• Listen to your favorite song\n• Take a warm shower\n• Write down 3 things you\'re grateful for\n\nSometimes the smallest acts of self-care make the biggest difference.',
    },
  ],
  'Coping Strategies': [
    {
      title: 'The 5-4-3-2-1 grounding technique',
      content: 'When anxiety hits, try this grounding technique:\n\n5 things you can see\n4 things you can touch\n3 things you can hear\n2 things you can smell\n1 thing you can taste\n\nThis helps bring you back to the present moment when your mind is racing.',
    },
    {
      title: 'Building a crisis toolkit',
      content: 'Having a plan for difficult moments can be really helpful. My crisis toolkit includes:\n\n• List of people I can call\n• Comforting activities (music, tea, blanket)\n• Grounding techniques\n• Reminder notes I wrote to myself on good days\n• Professional resources\n\nWhat would you include in yours?',
    },
  ],
  // Specialized content by condition
  'Panic Attack Support': [
    {
      title: 'Panic attack recovery tips that helped me',
      content: 'After years of panic attacks, here\'s what helped me:\n\n• Remember: panic attacks can\'t hurt you\n• Focus on slow, deep breathing\n• Use cold water on your wrists/face\n• Remind yourself it will pass\n• Have a support person you can text\n\nRecovery is possible. You\'re stronger than you think.',
    },
  ],
  'Exposure Therapy': [
    {
      title: 'Starting exposure therapy - what to expect',
      content: 'Beginning exposure therapy was terrifying, but it\'s been one of the most helpful treatments for my anxiety. Start small, work with a therapist, and be patient with yourself. Progress isn\'t always linear.',
    },
  ],
  'Mindfulness for Anxiety': [
    {
      title: 'Simple mindfulness practices for anxious moments',
      content: 'When anxiety peaks, these quick mindfulness practices help me:\n\n• Focus on your breath for 30 seconds\n• Name 3 things you can see, hear, and feel\n• Place your hand on your heart and feel it beating\n• Take 3 slow, deep belly breaths\n\nAnxiety wants us to rush - mindfulness helps us slow down.',
    },
  ],
  'Mood Tracking': [
    {
      title: 'Simple mood tracking that actually helps',
      content: 'I track my mood daily using a simple 1-10 scale plus one word about how I\'m feeling. It helps me identify patterns and triggers, and shows my therapist how I\'m doing between sessions.',
    },
  ],
  'Activity Scheduling': [
    {
      title: 'Behavioral activation changed my depression',
      content: 'When I was severely depressed, my therapist taught me about activity scheduling. Even when I didn\'t feel like it, planning one small activity each day gradually helped me feel more engaged with life.',
    },
  ],
  'Medication Support': [
    {
      title: 'Starting antidepressants - my experience',
      content: 'Starting medication was a big decision for me. The first few weeks were rough with side effects, but by week 6 I started feeling more like myself. Everyone\'s experience is different - work with your doctor and be patient.',
    },
  ],
  'Focus & Productivity': [
    {
      title: 'ADHD-friendly productivity tips',
      content: 'Some strategies that work for my ADHD brain:\n\n• Time blocking in 25-minute chunks\n• Using visual reminders and sticky notes\n• Body doubling (working alongside someone)\n• Breaking large tasks into tiny steps\n• Celebrating small wins\n\nWhat works for your brain?',
    },
  ],
  'Organization Tips': [
    {
      title: 'Organization systems that work with ADHD',
      content: 'I\'ve tried dozens of organization systems. Here\'s what actually stuck:\n\n• One inbox for everything\n• Visual reminders everywhere\n• Time-blocking instead of to-do lists\n• \'Good enough\' instead of perfect\n\nThe best system is the one you\'ll actually use.',
    },
  ],
  'Trauma Recovery': [
    {
      title: 'PTSD recovery is not linear',
      content: 'Some days I feel like I\'ve made so much progress, and then something triggers me and I feel like I\'m back at square one. My therapist reminds me that healing isn\'t linear - setbacks don\'t erase progress.',
    },
  ],
  'Grounding Techniques': [
    {
      title: 'Grounding techniques for flashbacks',
      content: 'When I feel a flashback coming on, these grounding techniques help:\n\n• Press my feet firmly into the ground\n• Hold an ice cube or splash cold water\n• Say the date and my location out loud\n• Focus on 5 things I can see right now\n\nRemember: You are safe. You are here. You survived.',
    },
  ],
  // New disorder-specific templates
  'Stress Reduction Techniques': [
    {
      title: 'Quick stress relief techniques that work',
      content: 'When stress hits hard, these quick techniques help me reset:\n\n• 4-7-8 breathing (inhale 4, hold 7, exhale 8)\n• Progressive muscle relaxation\n• 5-minute walk outside\n• Cold water on wrists and face\n• Listen to one calming song\n\nWhat stress relief techniques work for you?',
    },
  ],
  'Work-Life Balance': [
    {
      title: 'Setting boundaries with work stress',
      content: 'Learning to leave work at work has been crucial for my mental health. I had to set strict boundaries about checking emails after hours and communicating my availability clearly to colleagues.',
    },
  ],
  'Sleep Hygiene Tips': [
    {
      title: 'Sleep routine that changed my insomnia',
      content: 'After years of poor sleep, these changes made a difference:\n\n• No screens 1 hour before bed\n• Same bedtime/wake time every day\n• Cool, dark room (blackout curtains)\n• White noise or earplugs\n• No caffeine after 2 PM\n\nIt took 2-3 weeks to see results, but consistency was key.',
    },
  ],
  'Sleep Tracking': [
    {
      title: 'Sleep tracking helped me identify patterns',
      content: 'I started tracking my sleep and discovered that my worst nights happened after high-stress days. Now I can prepare better and practice extra relaxation techniques on those evenings.',
    },
  ],
  'Panic Attack Recovery': [
    {
      title: 'How I shortened my panic attacks',
      content: 'My panic attacks used to last 30+ minutes. Now they\'re usually under 10 minutes because:\n\n• I remind myself "this will pass"\n• I focus on slow, deep breathing\n• I don\'t fight the feeling, I let it flow\n• I have a support person I can text\n• I practice self-compassion afterward\n\nRecovery is possible.',
    },
  ],
  'Breathing Techniques': [
    {
      title: 'Breathing techniques for panic attacks',
      content: 'Box breathing saved me during panic attacks:\n\n1. Inhale for 4 counts\n2. Hold for 4 counts\n3. Exhale for 4 counts\n4. Hold empty for 4 counts\n5. Repeat\n\nIt helps reset my nervous system when panic hits.',
    },
  ],
  'Mood Stabilization': [
    {
      title: 'Daily habits that help stabilize my mood',
      content: 'Living with bipolar, these daily practices help keep me stable:\n\n• Consistent sleep schedule (same time every night)\n• Mood tracking app\n• Regular medication timing\n• Daily sunlight exposure\n• Gentle exercise routine\n\nStability comes from consistency.',
    },
  ],
  'Episode Prevention': [
    {
      title: 'Recognizing my early warning signs',
      content: 'Learning to recognize my early warning signs has been game-changing. For mania: talking faster, needing less sleep, increased spending. For depression: isolating, difficulty with hygiene, negative thought spirals. Early intervention makes all the difference.',
    },
  ],
  'Compulsion Management': [
    {
      title: 'Delaying compulsions - small wins add up',
      content: 'I\'ve been working on delaying my compulsions by just 1 minute at first. Now I can sometimes delay them by 10-15 minutes. It\'s not about stopping completely right away - it\'s about proving to myself that I have some control.',
    },
  ],
  'ERP (Exposure Response Prevention)': [
    {
      title: 'Starting ERP therapy - what to expect',
      content: 'ERP (Exposure and Response Prevention) felt impossible at first, but it\'s been the most effective treatment for my OCD. Start small, be patient with yourself, and trust the process. The anxiety does decrease with practice.',
    },
  ],
  'Intrusive Thoughts': [
    {
      title: 'Intrusive thoughts don\'t define you',
      content: 'The hardest part of OCD for me was learning that intrusive thoughts are just thoughts - they don\'t mean anything about who I am. My therapist taught me to label them: "I\'m having the thought that..." instead of believing them.',
    },
  ],
  'Social Skills Practice': [
    {
      title: 'Practicing small talk helped my social anxiety',
      content: 'I started practicing small talk with cashiers, baristas, neighbors. Having a few go-to topics ready (weather, current events, compliments) made conversations feel less scary. Practice really does help.',
    },
  ],
  'Public Speaking Support': [
    {
      title: 'Overcoming public speaking anxiety',
      content: 'Public speaking used to terrify me. What helped: practicing in front of a mirror, joining Toastmasters, recording myself, and remembering that the audience wants me to succeed, not fail.',
    },
  ],
  'Confidence Building': [
    {
      title: 'Building social confidence one interaction at a time',
      content: 'I started with tiny goals: make eye contact with one person, say hello to a neighbor, ask one question in a meeting. Each small success built my confidence for bigger social challenges.',
    },
  ],
  'Specific Phobias': [
    {
      title: 'Overcoming my fear of flying',
      content: 'My flight phobia was so severe I hadn\'t traveled in years. Through gradual exposure (watching plane videos, visiting airports, short flights) and therapy, I finally took a vacation last month. Progress is possible.',
    },
  ],
  'Gradual Exposure': [
    {
      title: 'The power of tiny steps in exposure therapy',
      content: 'Exposure therapy works, but start incredibly small. For my dog phobia, I started with pictures of puppies, then watching dog videos, then seeing dogs from across the street. Each step built courage for the next.',
    },
  ],
  'Work Boundaries': [
    {
      title: 'Burnout recovery: learning to say no',
      content: 'Burnout taught me that saying yes to everything means saying no to my wellbeing. I had to learn that setting boundaries isn\'t selfish - it\'s necessary for sustainable performance.',
    },
  ],
  'Energy Management': [
    {
      title: 'Managing energy during burnout recovery',
      content: 'During burnout recovery, I learned to treat energy like a finite resource. I prioritize the most important tasks when my energy is highest and give myself permission to rest without guilt.',
    },
  ],
  'Career Transitions': [
    {
      title: 'Changing careers after burnout',
      content: 'Burnout forced me to reevaluate what I actually wanted from my career. The transition was scary, but prioritizing work-life balance and meaningful work has made all the difference.',
    },
  ],
  'Sobriety Milestones': [
    {
      title: 'Celebrating 6 months sober today',
      content: 'Six months ago I couldn\'t imagine life without alcohol. Today I can\'t imagine going back. The first month was the hardest, but each day gets a little easier. To anyone struggling: you can do this.',
    },
  ],
  'Relapse Prevention': [
    {
      title: 'Building my relapse prevention toolkit',
      content: 'My toolkit includes: supportive people to call, activities that keep my hands busy, reminders of why I got sober, healthy coping strategies, and professional support. Having a plan makes all the difference.',
    },
  ],
  'Recovery Tools': [
    {
      title: 'Apps and tools that support my recovery',
      content: 'Recovery tools that help me: sobriety counter app, online support meetings, meditation apps, journal for cravings, and a list of people I can call. Technology can be a powerful ally in recovery.',
    },
  ],
};

// Comment templates for different types of responses
const COMMENT_TEMPLATES = [
  "Thank you for sharing this. It really resonates with me.",
  "I appreciate your vulnerability in posting this. You're not alone. ❤️",
  "This is so helpful! Thank you for taking the time to share your experience.",
  "Sending you love and support. You're doing great. 💙",
  "I relate to this so much. Thank you for putting it into words.",
  "This is exactly what I needed to hear today. Thank you.",
  "You're so brave for sharing this. I admire your strength.",
  "Thank you for this reminder. I needed it today.",
  "Your story gives me hope. Thank you for sharing.",
  "This community is so lucky to have you. Thank you for being here.",
  "I'm so proud of you for sharing this. That takes courage.",
  "This post made my day. Thank you for the positivity!",
  "I'm going to try this. Thank you for the suggestion!",
  "Bookmarking this for when I need it. Thank you!",
  "This is beautiful. Thank you for sharing your heart with us.",
  "You've articulated something I've been feeling but couldn't express. Thank you.",
  "I'm so grateful for your presence in this community.",
  "This gives me so much hope. Thank you for sharing your journey.",
  "I needed to read this today. Thank you for posting.",
  "Your strength is inspiring. Thank you for being here.",
  "This is such an important reminder. Thank you!",
  "I'm going to save this post. It's exactly what I needed.",
  "Thank you for creating a safe space with your words.",
  "This community feels like home because of people like you.",
  "Your post brought tears to my eyes (in a good way). Thank you.",
];

export async function seedCommunityContent(
  prisma: PrismaClient,
  communities: any[],
  users: any[]
) {
  console.log('📝 Creating realistic community content with predefined templates...');

  // Get all rooms across all communities
  const rooms = await prisma.room.findMany({
    include: {
      roomGroup: {
        include: {
          community: true,
        },
      },
    },
  });

  // Get memberships for all communities
  const memberships = await prisma.membership.findMany({
    include: {
      user: true,
      community: true,
    },
  });

  const posts = await seedPostsWithTemplates(prisma, rooms, memberships);
  const comments = await seedCommentsWithTemplates(prisma, posts, memberships);
  const hearts = await seedHeartsForContent(prisma, posts, comments, memberships);
  const reports = await seedReportsForContent(prisma, posts, comments, memberships);

  return {
    posts,
    comments,
    hearts,
    reports,
  };
}

async function seedPostsWithTemplates(prisma: PrismaClient, rooms: any[], memberships: any[]) {
  console.log('📄 Creating posts using predefined templates with bulk operations...');

  const posts: any[] = [];
  const postsToCreate: any[] = [];

  // Import bulk operations utilities
  const { chunkedBulkInsert } = await import('./scripts/bulk-operations');

  for (const room of rooms) {
    // Get members of this room's community
    const communityMembers = memberships.filter(
      (m) => m.communityId === room.roomGroup.communityId
    );

    if (communityMembers.length === 0) continue;

    // Get appropriate templates for this room
    const roomTemplates = POST_TEMPLATES[room.name] || POST_TEMPLATES['General Chat'];
    
    // Create posts data (increased from 1-3 to 5-15 based on SEED_CONFIG)
    const postsToCreateCount = Math.min(
      faker.number.int({ min: 5, max: 15 }),
      roomTemplates.length * 3  // Allow template reuse for more content
    );
    
    for (let i = 0; i < postsToCreateCount; i++) {
      // Select eligible members (respect posting roles in real app, but seed content for demo)
      const eligibleMembers = communityMembers;
      if (eligibleMembers.length === 0) continue;

      const author = faker.helpers.arrayElement(eligibleMembers);
      const template = faker.helpers.arrayElement(roomTemplates);

      // Add some variation to template content for reused templates
      const titleVariation = i > roomTemplates.length ? 
        ` (${faker.helpers.arrayElement(['Update', 'Follow-up', 'Question', 'Experience'])})` : '';
      
      const postData = {
        title: template.title + titleVariation,
        content: template.content,
        userId: author.userId,
        roomId: room.id,
        createdAt: faker.date.past({ years: 0.5 }), // Posts from last 6 months
      };

      postsToCreate.push(postData);
    }
  }

  if (postsToCreate.length > 0) {
    // Use bulk insert for better performance
    const result = await chunkedBulkInsert(prisma, 'post', postsToCreate, {
      operationName: 'community posts',
      chunkSize: 500,
      skipDuplicates: true
    });

    // Fetch the created posts for return
    const createdPosts = await prisma.post.findMany({
      where: {
        roomId: {
          in: [...new Set(postsToCreate.map(p => p.roomId))]
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    posts.push(...createdPosts);
    console.log(`✅ Created ${result.count} posts using bulk operations across ${rooms.length} rooms`);
  }

  return posts;
}

async function seedCommentsWithTemplates(prisma: PrismaClient, posts: any[], memberships: any[]) {
  console.log('💬 Creating supportive comments with bulk operations...');

  const comments: any[] = [];
  const commentsToCreate: any[] = [];

  // Import bulk operations utilities
  const { chunkedBulkInsert } = await import('./scripts/bulk-operations');

  // Get all rooms data to avoid repeated queries
  const roomsData = await prisma.room.findMany({
    where: {
      id: {
        in: [...new Set(posts.map(p => p.roomId))]
      }
    },
    include: {
      roomGroup: {
        include: {
          community: true,
        },
      },
    },
  });

  // Create a lookup map for faster access
  const roomLookup = new Map(roomsData.map(room => [room.id, room]));

  for (const post of posts) {
    const postRoom = roomLookup.get(post.roomId);
    if (!postRoom) continue;

    // Get members of this community (excluding the post author)
    const communityMembers = memberships.filter(
      (m) => m.communityId === postRoom.roomGroup.communityId && m.userId !== post.userId
    );

    if (communityMembers.length === 0) continue;

    // Create comments based on enhanced SEED_CONFIG (2-8 comments per post instead of 2-6)
    const commentCount = Math.min(
      faker.number.int({ min: 2, max: 8 }),
      communityMembers.length
    );
    
    for (let i = 0; i < commentCount; i++) {
      const commenter = faker.helpers.arrayElement(communityMembers);
      const commentText = faker.helpers.arrayElement(COMMENT_TEMPLATES);

      const commentData = {
        content: commentText,
        userId: commenter.userId,
        postId: post.id,
        createdAt: faker.date.between({
          from: post.createdAt,
          to: new Date(),
        }),
      };

      commentsToCreate.push(commentData);
    }
  }

  if (commentsToCreate.length > 0) {
    // Use bulk insert for better performance
    const result = await chunkedBulkInsert(prisma, 'comment', commentsToCreate, {
      operationName: 'supportive comments',
      chunkSize: 1000,
      skipDuplicates: true
    });

    // Fetch the created comments for return
    const createdComments = await prisma.comment.findMany({
      where: {
        postId: {
          in: [...new Set(commentsToCreate.map(c => c.postId))]
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    comments.push(...createdComments);
    console.log(`✅ Created ${result.count} supportive comments using bulk operations across ${posts.length} posts`);
  }

  return comments;
}

async function seedHeartsForContent(
  prisma: PrismaClient,
  posts: any[],
  comments: any[],
  memberships: any[]
) {
  console.log('❤️ Creating hearts (reactions) for posts and comments...');

  const postHearts: any[] = [];
  const commentHearts: any[] = [];

  // Create hearts for posts
  for (const post of posts) {
    const postRoom = await prisma.room.findUnique({
      where: { id: post.roomId },
      include: {
        roomGroup: {
          include: {
            community: true,
          },
        },
      },
    });

    if (!postRoom) continue;

    const communityMembers = memberships.filter(
      (m) => m.communityId === postRoom.roomGroup.communityId
    );

    // 40-80% of community members heart each post (mental health communities are supportive)
    const heartsCount = Math.floor(
      communityMembers.length * faker.number.float({ min: 0.4, max: 0.8 })
    );
    const heartersSelection = faker.helpers.arrayElements(communityMembers, heartsCount);

    for (const member of heartersSelection) {
      try {
        const heart = await prisma.postHeart.create({
          data: {
            userId: member.userId,
            postId: post.id,
            createdAt: faker.date.between({
              from: post.createdAt,
              to: new Date(),
            }),
          },
        });
        postHearts.push(heart);
      } catch (error) {
        // Skip duplicate hearts
      }
    }
  }

  // Create hearts for comments
  for (const comment of comments) {
    const commentPost = await prisma.post.findUnique({
      where: { id: comment.postId },
      include: {
        room: {
          include: {
            roomGroup: {
              include: {
                community: true,
              },
            },
          },
        },
      },
    });

    if (!commentPost?.room) continue;

    const communityMembers = memberships.filter(
      (m) => m.communityId === commentPost.room?.roomGroup.communityId
    );

    // 25-60% of community members heart each comment
    const heartsCount = Math.floor(
      communityMembers.length * faker.number.float({ min: 0.25, max: 0.6 })
    );
    const heartersSelection = faker.helpers.arrayElements(communityMembers, heartsCount);

    for (const member of heartersSelection) {
      try {
        const heart = await prisma.commentHeart.create({
          data: {
            userId: member.userId,
            commentId: comment.id,
            createdAt: faker.date.between({
              from: comment.createdAt,
              to: new Date(),
            }),
          },
        });
        commentHearts.push(heart);
      } catch (error) {
        // Skip duplicate hearts
      }
    }
  }

  console.log(`✅ Created ${postHearts.length} post hearts and ${commentHearts.length} comment hearts`);
  
  return {
    postHearts,
    commentHearts,
  };
}

async function seedReportsForContent(
  prisma: PrismaClient,
  posts: any[],
  comments: any[],
  memberships: any[]
) {
  console.log('🚨 Creating content reports for moderation...');

  const reports: any[] = [];

  // Create reports for some posts (about 5% of posts get reported)
  const postsToReport = faker.helpers.arrayElements(posts, Math.ceil(posts.length * 0.05));
  
  for (const post of postsToReport) {
    const postRoom = await prisma.room.findUnique({
      where: { id: post.roomId },
      include: {
        roomGroup: {
          include: {
            community: true,
          },
        },
      },
    });

    if (!postRoom) continue;

    const communityMembers = memberships.filter(
      (m) => m.communityId === postRoom.roomGroup.communityId
    );

    // Random member reports the post
    const reporter = faker.helpers.arrayElement(communityMembers);
    
    if (reporter.userId !== post.authorId) {
      try {
        const report = await prisma.report.create({
          data: {
            reporterId: reporter.userId,
            postId: post.id,
            reason: faker.helpers.arrayElement([
              'Inappropriate content',
              'Spam or promotional content',
              'Harassment or bullying',
              'False information',
              'Off-topic discussion',
              'Violation of community guidelines'
            ]),
            content: faker.helpers.arrayElement([
              'This post contains inappropriate language and may be triggering for other members.',
              'This appears to be spam or promotional content not related to mental health support.',
              'The content is harassing other community members.',
              'The information shared appears to be medically inaccurate.',
              'This post is not relevant to this community\'s purpose.',
              'The post violates our community guidelines about respectful communication.'
            ]),
            status: faker.helpers.arrayElement(['PENDING', 'PENDING', 'REVIEWED', 'DISMISSED']),
            createdAt: faker.date.between({
              from: post.createdAt,
              to: new Date(),
            }),
          },
        });
        reports.push(report);
      } catch (error) {
        // Skip if report already exists
      }
    }
  }

  // Create reports for some comments (about 3% of comments get reported)
  const commentsToReport = faker.helpers.arrayElements(comments, Math.ceil(comments.length * 0.03));
  
  for (const comment of commentsToReport) {
    const commentPost = await prisma.post.findUnique({
      where: { id: comment.postId },
      include: {
        room: {
          include: {
            roomGroup: {
              include: {
                community: true,
              },
            },
          },
        },
      },
    });

    if (!commentPost?.room) continue;

    const communityMembers = memberships.filter(
      (m) => m.communityId === commentPost.room?.roomGroup.communityId
    );

    // Random member reports the comment
    const reporter = faker.helpers.arrayElement(communityMembers);
    
    if (reporter.userId !== comment.authorId) {
      try {
        const report = await prisma.report.create({
          data: {
            reporterId: reporter.userId,
            commentId: comment.id,
            reason: faker.helpers.arrayElement([
              'Inappropriate content',
              'Spam or promotional content', 
              'Harassment or bullying',
              'False information',
              'Personal attack',
              'Violation of community guidelines'
            ]),
            content: faker.helpers.arrayElement([
              'This comment contains inappropriate language.',
              'This comment appears to be spam.',
              'The comment is personally attacking another member.',
              'The information in this comment is misleading.',
              'This comment is disrespectful to other community members.',
              'The comment violates our guidelines about supportive communication.'
            ]),
            status: faker.helpers.arrayElement(['PENDING', 'PENDING', 'REVIEWED', 'DISMISSED']),
            createdAt: faker.date.between({
              from: comment.createdAt,
              to: new Date(),
            }),
          },
        });
        reports.push(report);
      } catch (error) {
        // Skip if report already exists
      }
    }
  }

  console.log(`✅ Created ${reports.length} content reports`);
  return reports;
}

