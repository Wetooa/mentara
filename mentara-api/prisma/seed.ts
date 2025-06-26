// NOTE: For seeding database

import { PrismaClient } from '@prisma/client';
import { ILLNESS_COMMUNITIES } from '../src/communities/illness-communities.config';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create illness communities
  console.log('📚 Creating illness communities...');
  for (const communityConfig of ILLNESS_COMMUNITIES) {
    const existingCommunity = await prisma.community.findUnique({
      where: { slug: communityConfig.slug },
    });

    if (!existingCommunity) {
      await prisma.community.create({
        data: {
          name: communityConfig.name,
          description: communityConfig.description,
          slug: communityConfig.slug,
          illness: communityConfig.illness,
          isActive: true,
          isPrivate: false,
          memberCount: 0,
          postCount: 0,
        },
      });
      console.log(`✅ Created community: ${communityConfig.name}`);
    } else {
      console.log(`⏭️  Community already exists: ${communityConfig.name}`);
    }
  }

  // Create sample users if they don't exist
  console.log('👥 Creating sample users...');
  const sampleUsers = [
    {
      id: 'sample_user_1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
    },
    {
      id: 'sample_user_2',
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'user',
    },
    {
      id: 'sample_therapist_1',
      email: 'dr.wilson@example.com',
      firstName: 'Dr. Sarah',
      lastName: 'Wilson',
      role: 'therapist',
    },
  ];

  for (const userData of sampleUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userData.id },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: userData,
      });
      console.log(
        `✅ Created user: ${userData.firstName} ${userData.lastName}`,
      );
    } else {
      console.log(
        `⏭️  User already exists: ${userData.firstName} ${userData.lastName}`,
      );
    }
  }

  // Create sample therapist
  console.log('👨‍⚕️ Creating sample therapist...');
  const existingTherapist = await prisma.therapist.findUnique({
    where: { userId: 'sample_therapist_1' },
  });

  if (!existingTherapist) {
    await prisma.therapist.create({
      data: {
        userId: 'sample_therapist_1',
        email: 'dr.wilson@example.com',
        firstName: 'Dr. Sarah',
        lastName: 'Wilson',
        mobile: '+1234567890',
        province: 'Metro Manila',
        providerType: 'Clinical Psychologist',
        professionalLicenseType: 'PRC Licensed',
        isPRCLicensed: 'yes',
        prcLicenseNumber: 'PSY-12345',
        isLicenseActive: 'yes',
        practiceStartDate: new Date('2015-06-01'),
        areasOfExpertise: ['Anxiety', 'Depression', 'Stress'],
        therapeuticApproachesUsedList: ['CBT', 'Mindfulness', 'Solution-Focused'],
        languagesOffered: ['English', 'Tagalog'],
        providedOnlineTherapyBefore: 'yes',
        comfortableUsingVideoConferencing: 'yes',
        weeklyAvailability: '20-30 hours',
        preferredSessionLength: '60 minutes',
        accepts: ['Individual Therapy', 'Couples Therapy'],
        assessmentTools: ['GAD-7', 'PHQ-9'],
        illnessSpecializations: [
          'Anxiety',
          'Depression',
          'Stress',
          'Insomnia',
          'Burnout',
        ],
        patientSatisfaction: 4.8,
        totalPatients: 150,
        isActive: true,
        approved: true,
        status: 'approved',
        profileComplete: true,
      },
    });
    console.log('✅ Created sample therapist: Dr. Sarah Wilson');
  } else {
    console.log('⏭️  Sample therapist already exists');
  }

  // Create sample posts in communities
  console.log('📝 Creating sample posts...');
  const communities = await prisma.community.findMany({
    take: 5, // Get first 5 communities
  });

  const sampleUser = await prisma.user.findUnique({
    where: { id: 'sample_user_1' },
  });

  if (sampleUser && communities.length > 0) {
    const samplePosts = [
      {
        title: 'Welcome to our community!',
        content:
          "Hi everyone! I'm new here and looking forward to connecting with others who understand what I'm going through. Looking forward to sharing experiences and supporting each other.",
        communityId: communities[0].id,
      },
      {
        title: 'Coping strategies that work for me',
        content:
          'I wanted to share some techniques that have been helping me lately: 1) Deep breathing exercises, 2) Regular exercise, 3) Journaling my thoughts. What works for you?',
        communityId: communities[0].id,
      },
      {
        title: 'Feeling overwhelmed today',
        content:
          "Today has been really tough. Just needed to vent and know I'm not alone in this journey. Thanks for being here, everyone.",
        communityId: communities[1]?.id || communities[0].id,
      },
    ];

    for (const postData of samplePosts) {
      const existingPost = await prisma.post.findFirst({
        where: {
          title: postData.title,
          communityId: postData.communityId,
        },
      });

      if (!existingPost) {
        await prisma.post.create({
          data: {
            ...postData,
            userId: sampleUser.id,
          },
        });
        console.log(`✅ Created post: ${postData.title}`);

        // Update post count for community
        await prisma.community.update({
          where: { id: postData.communityId },
          data: {
            postCount: {
              increment: 1,
            },
          },
        });
      } else {
        console.log(`⏭️  Post already exists: ${postData.title}`);
      }
    }
  }

  // Create sample memberships
  console.log('👥 Creating sample memberships...');
  if (sampleUser && communities.length > 0) {
    for (const community of communities.slice(0, 3)) {
      const existingMembership = await prisma.membership.findFirst({
        where: {
          userId: sampleUser.id,
          communityId: community.id,
        },
      });

      if (!existingMembership) {
        await prisma.membership.create({
          data: {
            userId: sampleUser.id,
            communityId: community.id,
            role: 'member',
          },
        });
        console.log(`✅ Added user to community: ${community.name}`);

        // Update member count
        await prisma.community.update({
          where: { id: community.id },
          data: {
            memberCount: {
              increment: 1,
            },
          },
        });
      } else {
        console.log(`⏭️  Membership already exists for: ${community.name}`);
      }
    }
  }

  // Create posts with hearts and hierarchical comments
  console.log('💖 Creating posts with hearts and comments...');
  const sampleUser2 = await prisma.user.findUnique({
    where: { id: 'sample_user_2' },
  });

  if (sampleUser && sampleUser2 && communities.length > 0) {
    // Create a post with hearts in the Stress community
    const stressCommunity =
      communities.find((c) => c.illness === 'Stress') || communities[0];
    const heartedPost = await prisma.post.create({
      data: {
        title: 'This community has been so supportive! 💖',
        content:
          'I just wanted to say thank you to everyone here. Your support and understanding have made such a difference in my journey. This community truly feels like a safe space.',
        userId: sampleUser.id,
        communityId: stressCommunity.id,
        heartCount: 0, // Will be updated by hearts
      },
    });

    // Add hearts to the post
    await prisma.postHeart.createMany({
      data: [
        { postId: heartedPost.id, userId: sampleUser.id },
        { postId: heartedPost.id, userId: sampleUser2.id },
      ],
    });

    // Update heart count
    await prisma.post.update({
      where: { id: heartedPost.id },
      data: { heartCount: 2 },
    });

    console.log(`✅ Created hearted post: ${heartedPost.title}`);

    // Create comments with hierarchy
    const parentComment = await prisma.comment.create({
      data: {
        content:
          'I completely agree! This community has been a lifeline for me too.',
        userId: sampleUser2.id,
        postId: heartedPost.id,
        heartCount: 0,
      },
    });

    // Add heart to parent comment
    await prisma.commentHeart.create({
      data: {
        commentId: parentComment.id,
        userId: sampleUser.id,
      },
    });

    // Update comment heart count
    await prisma.comment.update({
      where: { id: parentComment.id },
      data: { heartCount: 1 },
    });

    // Create reply to parent comment
    const replyComment = await prisma.comment.create({
      data: {
        content:
          'Same here! The support is incredible. How long have you been part of this community?',
        userId: sampleUser.id,
        postId: heartedPost.id,
        parentId: parentComment.id,
        heartCount: 0,
      },
    });

    // Create another reply to the same parent
    const replyComment2 = await prisma.comment.create({
      data: {
        content: "I joined last month and it's been amazing so far!",
        userId: sampleUser2.id,
        postId: heartedPost.id,
        parentId: parentComment.id,
        heartCount: 0,
      },
    });

    // Create a nested reply (reply to a reply)
    const nestedReply = await prisma.comment.create({
      data: {
        content: "Welcome! I'm glad you found us. What brought you here?",
        userId: sampleUser.id,
        postId: heartedPost.id,
        parentId: replyComment2.id,
        heartCount: 0,
      },
    });

    console.log('✅ Created hierarchical comments with hearts');

    // Create another post with Anxiety community
    const anxietyCommunity =
      communities.find((c) => c.illness === 'Anxiety') || communities[1];
    if (anxietyCommunity) {
      const discussionPost = await prisma.post.create({
        data: {
          title: 'What coping strategies work best for you?',
          content:
            "I'm looking for new ways to manage my symptoms. Currently, I use meditation and exercise, but I'd love to hear what works for others in this community.",
          userId: sampleUser2.id,
          communityId: anxietyCommunity.id,
          heartCount: 0,
        },
      });

      // Add some hearts
      await prisma.postHeart.create({
        data: {
          postId: discussionPost.id,
          userId: sampleUser.id,
        },
      });

      await prisma.post.update({
        where: { id: discussionPost.id },
        data: { heartCount: 1 },
      });

      // Create a comment with multiple replies
      const strategyComment = await prisma.comment.create({
        data: {
          content:
            'I find that journaling really helps me process my thoughts and feelings.',
          userId: sampleUser.id,
          postId: discussionPost.id,
          heartCount: 0,
        },
      });

      const strategyReply1 = await prisma.comment.create({
        data: {
          content:
            'Journaling is great! Do you have any specific prompts you use?',
          userId: sampleUser2.id,
          postId: discussionPost.id,
          parentId: strategyComment.id,
          heartCount: 0,
        },
      });

      const strategyReply2 = await prisma.comment.create({
        data: {
          content:
            "I like to write about three things I'm grateful for each day.",
          userId: sampleUser.id,
          postId: discussionPost.id,
          parentId: strategyReply1.id,
          heartCount: 0,
        },
      });

      console.log(
        `✅ Created discussion post with comments: ${discussionPost.title}`,
      );
    }

    // Create a post in the Depression community
    const depressionCommunity = communities.find(
      (c) => c.illness === 'Depression',
    );
    if (depressionCommunity) {
      const depressionPost = await prisma.post.create({
        data: {
          title: 'Finding hope in dark times',
          content:
            "Today I managed to get out of bed and take a shower. It might seem small, but it's a victory for me. Just wanted to share this win with people who understand.",
          userId: sampleUser.id,
          communityId: depressionCommunity.id,
          heartCount: 0,
        },
      });

      // Add hearts to show support
      await prisma.postHeart.createMany({
        data: [{ postId: depressionPost.id, userId: sampleUser2.id }],
      });

      await prisma.post.update({
        where: { id: depressionPost.id },
        data: { heartCount: 1 },
      });

      // Create supportive comments
      const supportComment = await prisma.comment.create({
        data: {
          content:
            "That's amazing! Every small step counts. You're doing great!",
          userId: sampleUser2.id,
          postId: depressionPost.id,
          heartCount: 0,
        },
      });

      console.log(
        `✅ Created depression support post: ${depressionPost.title}`,
      );
    }

    // Update post count for communities
    await prisma.community.update({
      where: { id: stressCommunity.id },
      data: {
        postCount: {
          increment: 1,
        },
      },
    });

    if (anxietyCommunity) {
      await prisma.community.update({
        where: { id: anxietyCommunity.id },
        data: {
          postCount: {
            increment: 1,
          },
        },
      });
    }

    if (depressionCommunity) {
      await prisma.community.update({
        where: { id: depressionCommunity.id },
        data: {
          postCount: {
            increment: 1,
          },
        },
      });
    }
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
