// Phase 8: Community Content
// Creates posts, comments, and reactions in community rooms
// NOTE: This is the phase that was originally failing due to missing Room table

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { PhaseResult } from './progress-tracker';
import { SEED_CONFIG, SIMPLE_SEED_CONFIG } from '../config';

interface ContentPhaseData {
  posts: any[];
  comments: any[];
  hearts: any[];
}

export async function runPhase08Content(
  prisma: PrismaClient,
  communitiesData: any,
  usersData: any,
  config: 'comprehensive' | 'simple'
): Promise<PhaseResult> {
  console.log(`📝 PHASE 8: Creating community content (${config} mode)...`);

  try {
    const { communities } = communitiesData;
    const { users } = usersData;

    if (!communities?.length || !users?.length) {
      return {
        success: false,
        message: 'Missing required data from previous phases (communities or users)',
      };
    }

    // Check if content already exists (idempotent check)
    const existingPostsCount = await prisma.post.count();
    if (existingPostsCount > 0) {
      console.log(`⏭️ Found ${existingPostsCount} existing posts, skipping phase`);
      
      // Return existing data
      const existingPosts = await prisma.post.findMany();
      const existingComments = await prisma.comment.findMany();
      const existingHearts = await prisma.postHeart.findMany();

      return {
        success: true,
        message: `Found ${existingPostsCount} existing posts`,
        skipped: true,
        data: { posts: existingPosts, comments: existingComments, hearts: existingHearts },
      };
    }

    const seedConfig = config === 'simple' ? SIMPLE_SEED_CONFIG : SEED_CONFIG;
    
    // Get community members for content creation
    const memberships = await prisma.membership.findMany({
      include: { user: true, community: true },
    });

    if (!memberships.length) {
      return {
        success: false,
        message: 'No community memberships found. Phase 3 must complete first.',
      };
    }

    // Create posts and comments
    const posts = await createCommunityPosts(prisma, memberships, seedConfig);
    const comments = await createPostComments(prisma, posts, memberships, seedConfig);
    
    // Create reactions (hearts) for posts and comments
    const hearts = await createContentReactions(prisma, posts, comments, memberships);

    console.log(`✅ Phase 8 completed: Created ${posts.length} posts, ${comments.length} comments, ${hearts.length} reactions`);

    return {
      success: true,
      message: `Created ${posts.length} posts, ${comments.length} comments, ${hearts.length} reactions`,
      data: { posts, comments, hearts },
    };

  } catch (error) {
    console.error('❌ Phase 8 failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function createCommunityPosts(
  prisma: PrismaClient,
  memberships: any[],
  config: any
): Promise<any[]> {
  console.log('📝 Creating community posts...');
  
  const posts: any[] = [];
  const communities = [...new Set(memberships.map(m => m.community))];
  
  for (const community of communities) {
    // Get rooms for this community - This is where the original Room table error occurred
    const rooms = await prisma.room.findMany({
      where: {
        roomGroup: {
          communityId: community.id,
        },
      },
      include: {
        roomGroup: true,
      },
    });

    if (!rooms.length) {
      console.log(`⚠️ No rooms found for community ${community.name}, skipping posts`);
      continue;
    }

    // Filter to member-accessible rooms
    const memberRooms = rooms.filter(room => room.postingRole === 'member');
    if (!memberRooms.length) {
      console.log(`⚠️ No member-accessible rooms for ${community.name}, skipping posts`);
      continue;
    }

    const communityMembers = memberships.filter(m => m.communityId === community.id);
    
    // Create posts per community based on config
    for (let i = 0; i < config.COMMUNITIES.POSTS_PER_COMMUNITY; i++) {
      const author = faker.helpers.arrayElement(communityMembers).user;
      const room = faker.helpers.arrayElement(memberRooms);
      
      try {
        const post = await prisma.post.create({
          data: {
            title: generateSupportivePostTitle(),
            content: generateSupportivePostContent(),
            userId: author.id,
            roomId: room.id,
            createdAt: faker.date.past({ years: 1 }),
          },
        });
        posts.push(post);
      } catch (error) {
        console.log(`⚠️ Error creating post: ${error}`);
      }
    }
    
    console.log(`✅ Created ${config.COMMUNITIES.POSTS_PER_COMMUNITY} posts for ${community.name}`);
  }

  return posts;
}

async function createPostComments(
  prisma: PrismaClient,
  posts: any[],
  memberships: any[],
  config: any
): Promise<any[]> {
  console.log('💬 Creating post comments...');
  
  const comments: any[] = [];

  for (const post of posts) {
    // Get community members who can comment
    const postRoom = await prisma.room.findUnique({
      where: { id: post.roomId },
      include: { roomGroup: { include: { community: true } } },
    });

    if (!postRoom) continue;

    const communityMembers = memberships.filter(
      m => m.communityId === postRoom.roomGroup.community.id
    );

    // Create comments per post
    for (let i = 0; i < config.COMMUNITIES.COMMENTS_PER_POST; i++) {
      const commenter = faker.helpers.arrayElement(communityMembers).user;
      
      try {
        const comment = await prisma.comment.create({
          data: {
            content: generateSupportiveComment(),
            userId: commenter.id,
            postId: post.id,
            createdAt: faker.date.between({ from: post.createdAt, to: new Date() }),
          },
        });
        comments.push(comment);
      } catch (error) {
        console.log(`⚠️ Error creating comment: ${error}`);
      }
    }
  }

  console.log(`✅ Created ${comments.length} supportive comments`);
  return comments;
}

async function createContentReactions(
  prisma: PrismaClient,
  posts: any[],
  comments: any[],
  memberships: any[]
): Promise<any[]> {
  console.log('❤️ Creating content reactions...');
  
  const hearts: any[] = [];

  // Create hearts for posts (this is where the original error occurred)
  for (const post of posts) {
    try {
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

      if (!postRoom) {
        console.log(`⚠️ Post room not found for post ${post.id}, skipping hearts`);
        continue;
      }

      const communityMembers = memberships.filter(
        (m) => m.communityId === postRoom.roomGroup.community.id
      );

      // 40-80% of community members heart each post
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
              createdAt: faker.date.between({ from: post.createdAt, to: new Date() }),
            },
          });
          hearts.push(heart);
        } catch (error) {
          // Skip duplicate hearts
        }
      }
    } catch (error) {
      console.log(`⚠️ Error creating hearts for post ${post.id}: ${error}`);
    }
  }

  console.log(`✅ Created ${hearts.length} content reactions`);
  return hearts;
}

// Helper functions for generating supportive mental health content
function generateSupportivePostTitle(): string {
  const titles = [
    "Sharing my progress today",
    "Small wins this week",
    "Looking for support and encouragement",
    "Grateful for this community",
    "Taking it one day at a time",
    "Celebrating a milestone",
    "Asking for advice from the community",
    "Sharing what's been helping me lately",
    "Feeling hopeful today",
    "Learning to be kind to myself"
  ];
  return faker.helpers.arrayElement(titles);
}

function generateSupportivePostContent(): string {
  const content = [
    "I wanted to share that I've been making small progress lately. It's not always easy, but I'm learning to celebrate the little victories. Thank you all for being such a supportive community.",
    "Today was a tough day, but I remembered the coping strategies we've discussed here. Taking deep breaths and practicing mindfulness really helped. Grateful to have this space.",
    "I've been working with my therapist on new techniques and wanted to share what's been helpful in case it resonates with others. Remember, healing isn't linear.",
    "This community has been such a source of strength for me. Thank you for creating a safe space where we can all support each other on this journey.",
    "Some days are harder than others, but I'm learning that it's okay to not be okay. Sending love to everyone who needs it today."
  ];
  return faker.helpers.arrayElement(content);
}

function generateSupportiveComment(): string {
  const comments = [
    "Thank you for sharing this. Your courage inspires me.",
    "Sending you love and support. You're not alone in this.",
    "I really needed to hear this today. Thank you.",
    "You're doing amazing. Keep going, one step at a time.",
    "This resonates so much with me. Thank you for being vulnerable.",
    "Your strength shines through your words. Keep being you.",
    "I'm proud of you for sharing. That takes real courage.",
    "Grateful for your presence in this community.",
    "Your journey matters and so do you.",
    "Thank you for reminding us that we're all in this together."
  ];
  return faker.helpers.arrayElement(comments);
}