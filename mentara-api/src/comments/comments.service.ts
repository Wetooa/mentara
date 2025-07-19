import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { Comment, Prisma, User } from '@prisma/client';
import { CommentCreateInputDto, CommentUpdateInputDto } from 'mentara-commons';

// Define local response type to match actual unified comment structure
interface CommentResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  postId: string;
  userId: string;
  content: string;
  parentId: string | null; // For nested comments
  attachmentUrls: string[];
  attachmentNames: string[];
  attachmentSizes: number[];
  user?: any;
  hearts?: number; // Heart count
  children?: CommentResponse[]; // Nested comments
  heartCount?: number;
  childrenCount?: number; // Renamed from replyCount
  isHearted?: boolean;
}

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({ where: { id } });
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
          hearts: userId
            ? {
                where: {
                  userId,
                },
              }
            : false,
          _count: {
            select: {
              children: true,
              hearts: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
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

  async findOne(id: string): Promise<CommentResponse> {
    try {
      const comment = await this.prisma.comment.findUnique({
        where: { id },
        include: {
          user: true,
          children: {
            include: {
              user: true,
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
          hearts: true,
          _count: {
            select: {
              children: true,
              hearts: true,
            },
          },
        },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      return {
        ...comment,
        hearts: comment.hearts.length, // Count hearts instead of returning array
        childrenCount: comment._count.children,
      };
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

  async findByPostId(postId: string, userId?: string): Promise<Comment[]> {
    try {
      return await this.prisma.comment.findMany({
        where: {
          postId,
          parentId: null, // Only get top-level comments, children are included via nested include
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
          hearts: userId
            ? {
                where: {
                  userId,
                },
              }
            : false,
          _count: {
            select: {
              children: true,
              hearts: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
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

  async create(
    data: CommentCreateInputDto,
    userId: string,
    attachmentUrls: string[] = [],
    attachmentNames: string[] = [],
    attachmentSizes: number[] = [],
  ): Promise<CommentResponse> {
    try {
      const comment = await this.prisma.comment.create({
        data: {
          userId,
          postId: data.postId,
          content: data.content,
          parentId: data.parentId || null, // Support nested comments via parentId
          attachmentUrls,
          attachmentNames,
          attachmentSizes,
        },
        include: {
          user: true,
          hearts: true,
          children: {
            include: {
              user: true,
              _count: {
                select: {
                  children: true,
                  hearts: true,
                },
              },
            },
          },
          _count: {
            select: {
              children: true,
              hearts: true,
            },
          },
        },
      });

      return {
        ...comment,
        hearts: comment.hearts.length, // Count hearts instead of returning array
        childrenCount: comment._count.children,
      };
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

  async update(
    id: string,
    data: CommentUpdateInputDto,
    userId: string,
  ): Promise<CommentResponse> {
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

      const updatedComment = await this.prisma.comment.update({
        where: { id, userId },
        data: {
          content: data.content,
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
          hearts: true,
        },
      });

      return {
        ...updatedComment,
        hearts: updatedComment.hearts.length,
      };
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
          _count: {
            select: {
              children: true,
              hearts: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
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

  // Reply functionality is now unified into the Comment system via parentId
  // All nested comments are handled through the create() method with parentId
  // Heart functionality works for all comment levels through heartComment()

  // File attachments are now handled directly with attachment arrays
  // No separate file attachment models needed

  /**
   * Report a comment for inappropriate content
   */
  async reportComment(
    commentId: string,
    reporterId: string,
    reason: string,
    content?: string,
  ): Promise<string> {
    try {
      // Verify comment exists
      const comment = await this.prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      // Check if user already reported this comment
      const existingReport = await this.prisma.report.findFirst({
        where: {
          commentId,
          reporterId,
        },
      });

      if (existingReport) {
        throw new ForbiddenException('You have already reported this comment');
      }

      // Create the report
      const report = await this.prisma.report.create({
        data: {
          commentId,
          reporterId,
          reason,
          content,
          status: 'pending',
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
