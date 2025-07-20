// Content Seed Module
// Handles creation of community content: posts, comments, hearts

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { SEED_CONFIG } from './config';

export async function seedCommunityContent(
  prisma: PrismaClient,
  communities: any[],
  users: any[]
) {
  console.log('📝 Creating community content...');

  const posts: any[] = [];
  const comments: any[] = [];

  for (const community of communities) {
    // Get community members
    const memberships = await prisma.membership.findMany({
      where: { communityId: community.id },
      include: { user: true },
    });

    if (memberships.length === 0) continue;

    // Get existing rooms for this community (should be created by community seeding)
    const roomGroups = await prisma.roomGroup.findMany({
      where: { communityId: community.id },
      include: { rooms: true },
    });

    if (roomGroups.length === 0) {
      console.log(`⚠️  No room groups found for community ${community.name}, skipping content creation`);
      continue;
    }

    // Get all rooms that allow member posting
    const memberRooms = roomGroups
      .flatMap(group => group.rooms)
      .filter(room => room.postingRole === 'member');

    if (memberRooms.length === 0) {
      console.log(`⚠️  No member rooms found for community ${community.name}, skipping content creation`);
      continue;
    }

    // Create posts in different rooms
    for (let i = 0; i < SEED_CONFIG.COMMUNITIES.POSTS_PER_COMMUNITY; i++) {
      const author = faker.helpers.arrayElement(memberships).user;
      const room = faker.helpers.arrayElement(memberRooms);
      
      if (!author) continue;

      const post = await prisma.post.create({
        data: {
          title: generateCommunitySpecificTitle(community.name),
          content: generateCommunitySpecificContent(community.name),
          userId: author.id,
          roomId: room.id,
          createdAt: faker.date.past({ years: 0.5 }),
        },
      });
      posts.push(post);

      // Create comments for each post
      for (let j = 0; j < SEED_CONFIG.COMMUNITIES.COMMENTS_PER_POST; j++) {
        const commenter = faker.helpers.arrayElement(memberships).user!;
        const comment = await prisma.comment.create({
          data: {
            content: generateSupportiveComment(community.name),
            postId: post.id,
            userId: commenter.id,
            createdAt: faker.date.between({
              from: post.createdAt,
              to: new Date(),
            }),
          },
        });
        comments.push(comment);

        // Add some hearts to comments
        if (faker.datatype.boolean({ probability: 0.6 })) {
          const heartGiver = faker.helpers.arrayElement(memberships).user!;
          try {
            await prisma.commentHeart.create({
              data: {
                userId: heartGiver.id,
                commentId: comment.id,
              },
            });
          } catch (error) {
            // Skip if heart already exists
          }
        }
      }

      // Add some hearts to posts
      const heartCount = faker.number.int({
        min: 0,
        max: Math.min(5, memberships.length),
      });
      const heartGivers = faker.helpers.arrayElements(memberships, heartCount);
      for (const heartGiver of heartGivers) {
        try {
          await prisma.postHeart.create({
            data: {
              userId: heartGiver.user!.id,
              postId: post.id,
            },
          });
        } catch (error) {
          // Skip if heart already exists
        }
      }
    }
    console.log(
      `✅ Created content for ${community.name}: ${SEED_CONFIG.COMMUNITIES.POSTS_PER_COMMUNITY} posts with comments`,
    );
  }

  return { posts, comments };
}

function generateCommunitySpecificTitle(communityName: string): string {
  const baseOptions = [
    'Feeling better today',
    'Question about my journey',
    'Small victory to share',
    'Looking for advice',
    'Grateful for this community',
    'Progress update',
    'Difficult day, need support',
  ];

  if (communityName.includes('Anxiety')) {
    return faker.helpers.arrayElement([
      ...baseOptions,
      'Breathing techniques that work',
      'Managing social situations',
      'Panic attack recovery tips',
      'Work anxiety strategies',
    ]);
  } else if (communityName.includes('Depression')) {
    return faker.helpers.arrayElement([
      ...baseOptions,
      'Motivation on tough days',
      'Self-care routine ideas',
      'Energy level improvements',
      'Medication experience',
    ]);
  } else if (communityName.includes('ADHD')) {
    return faker.helpers.arrayElement([
      ...baseOptions,
      'Organization tips needed',
      'Focus strategies that work',
      'Time management wins',
      'Productivity tools review',
    ]);
  } else if (communityName.includes('PTSD')) {
    return faker.helpers.arrayElement([
      ...baseOptions,
      'Grounding techniques',
      'Therapy progress update',
      'Trigger management',
      'Sleep improvement tips',
    ]);
  }

  return faker.helpers.arrayElement(baseOptions);
}

function generateCommunitySpecificContent(communityName: string): string {
  const baseContent = [
    'I wanted to share something that\'s been on my mind lately.',
    'Today has been a mix of good and challenging moments.',
    'I\'ve been reflecting on my progress and wanted to get some perspective.',
    'This community has been so helpful in my journey.',
    'I hope everyone is taking care of themselves today.',
  ];

  if (communityName.includes('Anxiety')) {
    return faker.helpers.arrayElement([
      ...baseContent,
      'I\'ve been working on managing my anxiety in social situations and wanted to share what\'s been helping me.',
      'My therapist suggested some breathing techniques that have been really helpful during panic attacks.',
      'Work has been stressful lately and I\'m looking for strategies to manage anxiety in professional settings.',
    ]);
  } else if (communityName.includes('Depression')) {
    return faker.helpers.arrayElement([
      ...baseContent,
      'Some days are harder than others, but I\'m trying to focus on small victories.',
      'I\'ve been working on establishing a morning routine that helps set a positive tone for my day.',
      'Self-care has become such an important part of my routine. What works for you?',
    ]);
  } else if (communityName.includes('ADHD')) {
    return faker.helpers.arrayElement([
      ...baseContent,
      'I\'ve been experimenting with different organization systems and wanted to share what\'s been working.',
      'Focus has been a real challenge lately. Does anyone have strategies that help with concentration?',
      'Time management is something I\'m always working on. What tools or techniques do you find helpful?',
    ]);
  }

  return faker.helpers.arrayElement(baseContent) + ' ' + faker.lorem.paragraph();
}

function generateSupportiveComment(communityName: string): string {
  const supportiveResponses = [
    'Thank you for sharing this with us.',
    'You\'re doing great, keep going!',
    'I can really relate to what you\'re going through.',
    'This community is here for you.',
    'Your strength is inspiring.',
    'That sounds like a really positive step forward.',
    'Have you considered talking to your therapist about this?',
    'Small steps are still progress.',
    'Sending you support and encouragement.',
    'I\'ve been in a similar place and it does get better.',
  ];

  return faker.helpers.arrayElement(supportiveResponses);
}