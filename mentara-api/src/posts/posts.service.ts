import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { Post, Prisma, User } from '@prisma/client';

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
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
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
        files: true,
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
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
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
        files: true,
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

  async create(data: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.post.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        files: true,
      },
    });
  }

  async update(
    id: string,
    data: Prisma.PostUpdateInput,
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
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        files: true,
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
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        files: true,
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

  async findByCommunityId(
    communityId: string,
    userId?: string,
  ): Promise<Post[]> {
    return this.prisma.post.findMany({
      where: {
        communityId,
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
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
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
        files: true,
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
}
