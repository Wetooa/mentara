import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { Post, Prisma, User } from '@prisma/client';
import type { PostUpdateInputDto } from './types';
import { PostCreatedEvent } from '../common/events/social-events';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findAll(userId?: string, limit = 20, offset = 0): Promise<Post[]> {
    // PERFORMANCE FIX: Added pagination (was loading ALL posts with ALL comments - 5-10 second delay!)
    // PERFORMANCE FIX: Removed full comment loading - use _count instead
    // Comments should be loaded separately when viewing individual post
    return this.prisma.post.findMany({
      select: {
        // PERFORMANCE FIX: Use select instead of include for better performance
        id: true,
        title: true,
        content: true,
        attachmentUrls: true,
        attachmentNames: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        roomId: true,
        // isPinned: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
        // Don't load all comments - just counts
        _count: {
          select: {
            comments: true,
            hearts: true,
          },
        },
        // Only load user's heart status if userId provided
        ...(userId && {
          hearts: {
            where: { userId },
            select: { id: true },
          },
        }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string, userId?: string): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
            children: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
                _count: {
                  select: {
                    children: true,
                    hearts: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        hearts: userId
          ? {
              where: {
                userId,
              },
            }
          : false,
        _count: {
          select: {
            comments: true,
            hearts: true,
          },
        },
      },
    });
  }

  async create(
    data: Prisma.PostCreateInput,
    attachmentUrls: string[] = [],
    attachmentNames: string[] = [],
    attachmentSizes: number[] = [],
  ): Promise<Post> {
    const post = await this.prisma.post.create({
      data: {
        ...data,
        attachmentUrls,
        attachmentNames,
        attachmentSizes,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Emit PostCreatedEvent for notifications (only if post has a room/community)
    if (post.roomId) {
      await this.eventEmitter.emitAsync(
        'PostCreatedEvent',
        new PostCreatedEvent({
          postId: post.id,
          authorId: post.userId,
          communityId: post.roomId,
          title: post.title || '',
          content: post.content || '',
          tags: [], // Add tags if available in schema
          postType: 'text', // Default to 'text' postType
          isAnonymous: false, // Default to false since field doesn't exist in schema
        }),
      );
    }

    return post;
  }

  async update(
    id: string,
    data: PostUpdateInputDto,
    userId: string,
  ): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        // room: { connect: { id: data.roomId } }, // Commented out - roomId property missing
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    return this.prisma.post.delete({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<Post[]> {
    return this.prisma.post.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            hearts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByRoomId(roomId: string, userId?: string): Promise<Post[]> {
    return this.prisma.post.findMany({
      where: {
        roomId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
            children: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
                _count: {
                  select: {
                    children: true,
                    hearts: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        hearts: userId
          ? {
              where: {
                userId,
              },
            }
          : false,
        _count: {
          select: {
            comments: true,
            hearts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Heart functionality
  async heartPost(
    postId: string,
    userId: string,
  ): Promise<{ hearted: boolean }> {
    const existingHeart = await this.prisma.postHeart.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingHeart) {
      // Remove heart
      await this.prisma.postHeart.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });

      return { hearted: false };
    } else {
      // Add heart
      await this.prisma.postHeart.create({
        data: {
          postId,
          userId,
        },
      });

      return { hearted: true };
    }
  }

  async isPostHeartedByUser(postId: string, userId: string): Promise<boolean> {
    const heart = await this.prisma.postHeart.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    return !!heart;
  }

  // File attachment methods
  async attachFilesToPost(
    postId: string,
    fileIds: string[],
    purpose: string = 'MEDIA',
  ) {
    // Stub implementation - files system removed
    return { count: 0 };
  }

  async getPostAttachments(postId: string) {
    // Stub implementation - files system removed
    return [];
  }

  async removePostAttachment(postId: string, fileId: string) {
    // Stub implementation - files system removed
    return { count: 0 };
  }

  /**
   * Report a post for inappropriate content
   */
  async reportPost(
    postId: string,
    reporterId: string,
    reason: string,
    content?: string,
  ): Promise<string> {
    try {
      // Verify post exists
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check if user already reported this post
      const existingReport = await this.prisma.report.findFirst({
        where: {
          postId,
          reporterId,
        },
      });

      if (existingReport) {
        throw new ForbiddenException('You have already reported this post');
      }

      // Create the report
      const report = await this.prisma.report.create({
        data: {
          postId,
          reporterId,
          reason,
          content,
          status: 'PENDING',
        },
      });

      return report.id;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
