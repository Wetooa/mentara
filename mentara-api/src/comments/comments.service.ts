import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { Comment, Prisma, User, Reply } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({ where: { id } });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async findAll(userId?: string): Promise<Comment[]> {
    try {
      return await this.prisma.comment.findMany({
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
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
            orderBy: {
              createdAt: 'asc',
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
              replies: true,
              hearts: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async findOne(id: string, userId?: string): Promise<Comment | null> {
    try {
      return await this.prisma.comment.findUnique({
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
          post: {
            select: {
              id: true,
              title: true,
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
              replies: true,
              hearts: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async findByPostId(postId: string, userId?: string): Promise<Comment[]> {
    try {
      return await this.prisma.comment.findMany({
        where: {
          postId,
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
              replies: true,
              hearts: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async create(data: Prisma.CommentCreateInput): Promise<Comment> {
    try {
      return await this.prisma.comment.create({
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
          post: {
            select: {
              id: true,
              title: true,
            },
          },
          files: true,
        },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async update(
    id: string,
    data: Prisma.CommentUpdateInput,
    userId: string,
  ): Promise<Comment> {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      if (comment.userId !== userId) {
        throw new ForbiddenException('You can only edit your own comments');
      }

      return await this.prisma.comment.update({
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
          post: {
            select: {
              id: true,
              title: true,
            },
          },
          files: true,
        },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async remove(id: string, userId: string): Promise<Comment> {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      if (comment.userId !== userId) {
        throw new ForbiddenException('You can only delete your own comments');
      }

      return await this.prisma.comment.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async findByUserId(userId: string): Promise<Comment[]> {
    try {
      return await this.prisma.comment.findMany({
        where: {
          userId,
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
          post: {
            select: {
              id: true,
              title: true,
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
          files: true,
          _count: {
            select: {
              replies: true,
              hearts: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  // Heart functionality
  async heartComment(
    commentId: string,
    userId: string,
  ): Promise<{ hearted: boolean }> {
    try {
      const existingHeart = await this.prisma.commentHeart.findUnique({
        where: {
          commentId_userId: {
            commentId,
            userId,
          },
        },
      });

      if (existingHeart) {
        // Remove heart
        await this.prisma.commentHeart.delete({
          where: {
            commentId_userId: {
              commentId,
              userId,
            },
          },
        });

        return { hearted: false };
      } else {
        // Add heart
        await this.prisma.commentHeart.create({
          data: {
            commentId,
            userId,
          },
        });

        return { hearted: true };
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  async isCommentHeartedByUser(
    commentId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const heart = await this.prisma.commentHeart.findUnique({
        where: {
          commentId_userId: {
            commentId,
            userId,
          },
        },
      });

      return !!heart;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  // Add reply creation
  async createReply(data: Prisma.ReplyCreateInput): Promise<Reply> {
    try {
      return await this.prisma.reply.create({
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
          comment: true,
          hearts: true,
        },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  // Fetch replies for a comment, with heart info/count
  async findRepliesByCommentId(
    commentId: string,
    userId?: string,
  ): Promise<any[]> {
    try {
      return await this.prisma.reply.findMany({
        where: { commentId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          hearts: userId
            ? {
                where: { userId },
              }
            : true,
          _count: {
            select: { hearts: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  // Heart/unheart a reply
  async heartReply(
    replyId: string,
    userId: string,
  ): Promise<{ hearted: boolean }> {
    try {
      const existingHeart = await this.prisma.replyHeart.findUnique({
        where: {
          replyId_userId: {
            replyId,
            userId,
          },
        },
      });

      if (existingHeart) {
        // Remove heart
        await this.prisma.replyHeart.delete({
          where: {
            replyId_userId: {
              replyId,
              userId,
            },
          },
        });
        return { hearted: false };
      } else {
        // Add heart
        await this.prisma.replyHeart.create({
          data: {
            replyId,
            userId,
          },
        });
        return { hearted: true };
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  // Check if a reply is hearted by a user
  async isReplyHeartedByUser(
    replyId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const heart = await this.prisma.replyHeart.findUnique({
        where: {
          replyId_userId: {
            replyId,
            userId,
          },
        },
      });
      return !!heart;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
