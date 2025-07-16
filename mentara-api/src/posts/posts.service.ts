import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import {
  Post,
  Prisma,
  User,
} from '@prisma/client';
import { PostUpdateInputDto } from 'mentara-commons';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findAll(userId?: string): Promise<Post[]> {
    return this.prisma.post.findMany({
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
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
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
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
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
    return this.prisma.post.create({
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
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
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
}
