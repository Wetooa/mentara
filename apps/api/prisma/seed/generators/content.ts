/**
 * Content Generator
 * 
 * Creates community posts, comments, and engagement data
 */

import { PrismaClient } from '@prisma/client';
import { ContentConfig } from '../config';
import { UsersData } from './users';
import { CommunitiesData } from './communities';

export interface ContentData {
  roomGroups: any[];
  rooms: any[];
  posts: any[];
  comments: any[];
  postHearts: any[];
  commentHearts: any[];
  /** Counts for logging when hearts are not retained in memory */
  postHeartsCount?: number;
  commentHeartsCount?: number;
}

/**
 * Sample content for mental health communities
 */
const SAMPLE_POSTS = {
  mentalHealth: [
    {
      title: "Starting my therapy journey today",
      content: "After months of thinking about it, I finally scheduled my first therapy session. Feeling nervous but hopeful. Any advice for a first-timer?",
      tags: ["therapy", "first-time", "anxiety"]
    },
    {
      title: "Small wins matter too",
      content: "Today I managed to get out of bed, take a shower, and make myself breakfast. It might not seem like much, but for me it's a huge step forward. Celebrating the small victories. 💪",
      tags: ["depression", "self-care", "progress"]
    },
    {
      title: "Mindfulness technique that's been helping me",
      content: "I've been practicing the 5-4-3-2-1 grounding technique when I feel overwhelmed. Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. It really helps bring me back to the present moment.",
      tags: ["mindfulness", "anxiety", "coping-skills"]
    },
    {
      title: "Dealing with setbacks",
      content: "Had a really rough week and feel like I've lost all the progress I made. How do you all handle setbacks in your mental health journey? Feeling pretty discouraged right now.",
      tags: ["setbacks", "recovery", "support"]
    },
    {
      title: "The importance of sleep hygiene",
      content: "My therapist recommended establishing a better sleep routine, and wow, what a difference it's made. No screens an hour before bed, keeping the room cool, and some light reading. My anxiety has decreased noticeably.",
      tags: ["sleep", "anxiety", "self-care"]
    },
    {
      title: "Finding the right therapist",
      content: "It took me three tries to find a therapist I really clicked with. Don't give up if the first one isn't the right fit - it's worth shopping around to find someone who truly understands you.",
      tags: ["therapy", "therapist-search", "advice"]
    },
    {
      title: "Meditation app recommendations?",
      content: "I'm trying to get into meditation but finding it hard to focus. Can anyone recommend good apps or resources for beginners? Preferably something free or low-cost.",
      tags: ["meditation", "apps", "beginner"]
    },
    {
      title: "Panic attack recovery strategies",
      content: "What do you all do immediately after a panic attack to help yourself recover? I always feel so drained and shaky afterwards. Looking for ways to bounce back faster.",
      tags: ["panic-attacks", "recovery", "coping"]
    }
  ],
  general: [
    {
      title: "Weekly check-in thread",
      content: "How is everyone doing this week? Share your highs, lows, and anything in between. This is a safe space to express whatever you're feeling. 🤗",
      tags: ["check-in", "community", "support"]
    },
    {
      title: "Gratitude practice",
      content: "My therapist suggested keeping a gratitude journal. Today I'm grateful for: warm coffee on a cold morning, a text from a friend checking in, and this supportive community. What are you grateful for today?",
      tags: ["gratitude", "positivity", "journal"]
    },
    {
      title: "Book recommendations for mental health",
      content: "I just finished 'The Body Keeps the Score' and found it incredibly insightful for understanding trauma. What books have helped you on your mental health journey?",
      tags: ["books", "resources", "education"]
    },
    {
      title: "Workplace mental health",
      content: "Struggling with setting boundaries at work. My job is very demanding and it's affecting my mental health. How do you all manage work-related stress and prevent burnout?",
      tags: ["work", "boundaries", "stress"]
    },
    {
      title: "Creative outlets for healing",
      content: "I've been doing art therapy and it's amazing how much I can express through painting that I struggle to put into words. What creative activities help your mental health?",
      tags: ["art-therapy", "creativity", "expression"]
    }
  ]
};

const SAMPLE_COMMENTS = [
  "Thank you for sharing this. I really needed to hear it today.",
  "You're not alone in feeling this way. Sending you strength and support.",
  "This is such a helpful perspective. I'm going to try this approach.",
  "I can really relate to what you're going through. It does get better.",
  "Have you talked to your therapist about this? They might have some good strategies.",
  "I'm proud of you for taking this step. That takes real courage.",
  "This resonates with me so much. Thank you for being vulnerable and sharing.",
  "Small steps are still steps forward. You're doing great.",
  "I've been through something similar. Feel free to message me if you want to talk.",
  "This is a great reminder that healing isn't linear. Thank you.",
  "Your strength inspires me. Keep going, you've got this.",
  "I needed this reminder today. Thank you for posting.",
  "What a wonderful way to look at it. I'm going to remember this.",
  "You're being so kind to yourself, and that's beautiful to see.",
  "This community is so supportive. I'm grateful to be here with all of you."
];

/**
 * Generate community content (posts and comments)
 */
export async function generateContent(
  prisma: PrismaClient,
  config: ContentConfig,
  usersData: UsersData,
  communitiesData: CommunitiesData
): Promise<ContentData> {
  console.log('  Creating community content...');
  
  const result: ContentData = {
    roomGroups: [],
    rooms: [],
    posts: [],
    comments: [],
    postHearts: [],
    commentHearts: [],
  };

  // Get users who can create content (members of communities)
  const contentCreators = [
    ...usersData.clients.map(c => c.user),
    ...usersData.moderators.map(m => m.user),
  ];

  // Create room structure for communities
  await createRoomStructure(prisma, communitiesData, result);

  // Create posts
  await createPosts(prisma, config, contentCreators, result);

  // Create comments
  await createComments(prisma, config, contentCreators, result);

  // Create engagement (hearts/likes)
  await createEngagement(prisma, config, contentCreators, result);

  const heartsLog = result.postHeartsCount != null && result.commentHeartsCount != null
    ? `${result.postHeartsCount} post hearts, ${result.commentHeartsCount} comment hearts`
    : `${result.postHearts.length} post hearts, ${result.commentHearts.length} comment hearts`;
  console.log(`    ✅ ${result.posts.length} posts created`);
  console.log(`    ✅ ${result.comments.length} comments created`);
  console.log(`    ✅ ${heartsLog}`);

  return result;
}

/**
 * Create room structure for communities
 */
async function createRoomStructure(
  prisma: PrismaClient,
  communitiesData: CommunitiesData,
  result: ContentData
): Promise<void> {
  for (const community of communitiesData.communities) {
    // Create a default room group for each community
    const roomGroup = await prisma.roomGroup.create({
      data: {
        name: 'General',
        order: 1,
        communityId: community.id,
      },
    });
    
    result.roomGroups.push(roomGroup);

    // Create a general discussion room
    const room = await prisma.room.create({
      data: {
        name: 'General Discussion',
        order: 1,
        postingRole: 'member',
        roomGroupId: roomGroup.id,
      },
    });
    
    result.rooms.push(room);
  }
}

/**
 * Create community posts
 */
async function createPosts(
  prisma: PrismaClient,
  config: ContentConfig,
  contentCreators: any[],
  result: ContentData
): Promise<void> {
  for (const room of result.rooms) {
    const postsToCreate = Math.floor(config.postsPerUser * (contentCreators.length / result.rooms.length));
    
    for (let i = 0; i < postsToCreate; i++) {
      const author = randomChoice(contentCreators);
      
      // Choose appropriate content - default to mental health posts for now
      const samplePosts = SAMPLE_POSTS.mentalHealth;
      const postTemplate = randomChoice(samplePosts);
      
      try {
        const post = await prisma.post.create({
          data: {
            title: postTemplate.title,
            content: postTemplate.content,
            userId: author.id,
            roomId: room.id,
            createdAt: randomPastDate(90),
            updatedAt: randomPastDate(30),
          },
        });
        
        result.posts.push(post);
      } catch (error) {
        console.log(`    ⚠️  Failed to create post: ${error}`);
      }
    }
  }
}

/**
 * Create comments on posts
 */
async function createComments(
  prisma: PrismaClient,
  config: ContentConfig,
  contentCreators: any[],
  result: ContentData
): Promise<void> {
  for (const post of result.posts) {
    const commentsToCreate = Math.min(5, randomInt(1, config.commentsPerPost + 1));
    
    for (let i = 0; i < commentsToCreate; i++) {
      const commenter = randomChoice(contentCreators);
      
      // Don't let users comment on their own posts too often
      if (commenter.id === post.userId && Math.random() > 0.2) continue;
      
      const commentContent = randomChoice(SAMPLE_COMMENTS);
      
      try {
        const comment = await prisma.comment.create({
          data: {
            content: commentContent,
            userId: commenter.id,
            postId: post.id,
            createdAt: new Date(post.createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Within a week of post
          },
        });
        
        result.comments.push(comment);
      } catch (error) {
        console.log(`    ⚠️  Failed to create comment: ${error}`);
      }
    }
  }
}

/** Max users to consider for hearts per post/comment to avoid O(n²) memory and DB load */
const MAX_HEARTERS_PER_ITEM = 12;

/**
 * Create engagement (hearts/likes). Capped per item to avoid huge memory and DB load.
 */
async function createEngagement(
  prisma: PrismaClient,
  config: ContentConfig,
  contentCreators: any[],
  result: ContentData
): Promise<void> {
  let postHeartsCreated = 0;
  let commentHeartsCreated = 0;

  // Shuffle and take a subset so we don't iterate all users for every post
  const shuffledUsers = [...contentCreators].sort(() => Math.random() - 0.5);
  const hearterPool = shuffledUsers.slice(0, Math.min(MAX_HEARTERS_PER_ITEM, contentCreators.length));

  for (const post of result.posts) {
    for (const user of hearterPool) {
      if (user.id === post.userId) continue;
      if (Math.random() >= config.heartLikelihoodForPosts) continue;
      try {
        await prisma.postHeart.create({
          data: {
            userId: user.id,
            postId: post.id,
            createdAt: new Date(post.createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
          },
        });
        postHeartsCreated++;
      } catch {
        // Skip duplicate hearts
      }
    }
  }

  for (const comment of result.comments) {
    for (const user of hearterPool) {
      if (user.id === comment.userId) continue;
      if (Math.random() >= config.heartLikelihoodForComments) continue;
      try {
        await prisma.commentHeart.create({
          data: {
            userId: user.id,
            commentId: comment.id,
            createdAt: new Date(comment.createdAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000),
          },
        });
        commentHeartsCreated++;
      } catch {
        // Skip duplicate hearts
      }
    }
  }

  result.postHeartsCount = postHeartsCreated;
  result.commentHeartsCount = commentHeartsCreated;
}

/**
 * Utility functions
 */
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPastDate(daysAgo: number): Date {
  const ms = Date.now() - Math.random() * daysAgo * 24 * 60 * 60 * 1000;
  return new Date(ms);
}