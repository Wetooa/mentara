import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../providers/prisma-client.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { VoteType, AwardType, ContentType, ReportReason, ReportStatus } from '@prisma/client';

interface VoteDto {
  contentId: string;
  contentType: ContentType;
  voteType: VoteType;
  userId: string;
}

interface AwardDto {
  contentId: string;
  contentType: ContentType;
  awardType: AwardType;
  userId: string;
  message?: string;
  isAnonymous?: boolean;
}

interface ReportDto {
  contentId: string;
  contentType: ContentType;
  reason: ReportReason;
  description?: string;
  reporterId: string;
}

interface NestedCommentDto {
  postId: string;
  parentId?: string;
  content: string;
  userId: string;
}

interface VoteCount {
  upvotes: number;
  downvotes: number;
  score: number; // upvotes - downvotes
}

interface CommentWithReplies {
  id: string;
  content: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    karma: number;
  };
  createdAt: Date;
  updatedAt: Date;
  depth: number;
  votes: VoteCount;
  awards: {
    type: AwardType;
    count: number;
    isAnonymous: boolean;
    message?: string;
  }[];
  children: CommentWithReplies[];
  userVote?: VoteType;
  canEdit: boolean;
  canDelete: boolean;
  canReport: boolean;
}

interface PostWithEnhancedData {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    karma: number;
  };
  createdAt: Date;
  updatedAt: Date;
  votes: VoteCount;
  awards: {
    type: AwardType;
    count: number;
    totalValue: number;
  }[];
  commentCount: number;
  userVote?: VoteType;
  userAwards: AwardType[];
  isSaved: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canReport: boolean;
}

@Injectable()
export class RedditFeaturesService {
  private readonly logger = new Logger(RedditFeaturesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  // ===== VOTING SYSTEM =====

  /**
   * Vote on a post or comment
   */
  async vote(dto: VoteDto): Promise<VoteCount> {
    const { contentId, contentType, voteType, userId } = dto;

    try {
      if (contentType === ContentType.POST) {
        return await this.voteOnPost(contentId, userId, voteType);
      } else {
        return await this.voteOnComment(contentId, userId, voteType);
      }
    } catch (error) {
      this.logger.error(`Error voting on ${contentType} ${contentId}:`, error);
      throw error;
    }
  }

  /**
   * Remove vote from content
   */
  async removeVote(contentId: string, contentType: ContentType, userId: string): Promise<VoteCount> {
    try {
      if (contentType === ContentType.POST) {
        await this.prisma.postVote.deleteMany({
          where: { postId: contentId, userId }
        });
        return await this.getPostVoteCount(contentId);
      } else {
        await this.prisma.commentVote.deleteMany({
          where: { commentId: contentId, userId }
        });
        return await this.getCommentVoteCount(contentId);
      }
    } catch (error) {
      this.logger.error(`Error removing vote from ${contentType} ${contentId}:`, error);
      throw error;
    }
  }

  /**
   * Get vote counts for content
   */
  async getVoteCount(contentId: string, contentType: ContentType): Promise<VoteCount> {
    try {
      if (contentType === ContentType.POST) {
        return await this.getPostVoteCount(contentId);
      } else {
        return await this.getCommentVoteCount(contentId);
      }
    } catch (error) {
      this.logger.error(`Error getting vote count for ${contentType} ${contentId}:`, error);
      throw error;
    }
  }

  // ===== AWARDS SYSTEM =====

  /**
   * Give an award to content
   */
  async giveAward(dto: AwardDto): Promise<void> {
    const { contentId, contentType, awardType, userId, message, isAnonymous = false } = dto;

    try {
      // Check if user has enough karma/coins for premium awards
      if (this.isPremiumAward(awardType)) {
        await this.validatePremiumAwardEligibility(userId, awardType);
      }

      if (contentType === ContentType.POST) {
        await this.prisma.postAward.create({
          data: {
            postId: contentId,
            userId,
            awardType,
            message,
            isAnonymous
          }
        });

        // Update author karma
        const post = await this.prisma.post.findUnique({
          where: { id: contentId },
          select: { userId: true }
        });

        if (post?.userId) {
          await this.updateUserKarma(post.userId, 'award', this.getAwardKarmaValue(awardType));
        }
      } else {
        await this.prisma.commentAward.create({
          data: {
            commentId: contentId,
            userId,
            awardType,
            message,
            isAnonymous
          }
        });

        // Update author karma
        const comment = await this.prisma.comment.findUnique({
          where: { id: contentId },
          select: { userId: true }
        });

        if (comment?.userId) {
          await this.updateUserKarma(comment.userId, 'award', this.getAwardKarmaValue(awardType));
        }
      }

      // Emit event for notifications
      this.eventEmitter.emit('content.award.given', {
        contentId,
        contentType,
        awardType,
        giverId: userId,
        isAnonymous,
        timestamp: new Date()
      });

      this.logger.log(`Award ${awardType} given to ${contentType} ${contentId} by user ${userId}`);

    } catch (error) {
      this.logger.error(`Error giving award to ${contentType} ${contentId}:`, error);
      throw error;
    }
  }

  // ===== NESTED COMMENTS =====

  /**
   * Create a nested comment
   */
  async createNestedComment(dto: NestedCommentDto): Promise<CommentWithReplies> {
    const { postId, parentId, content, userId } = dto;

    try {
      let depth = 0;
      let threadId: string | null = null;

      // If this is a reply, calculate depth and thread
      if (parentId) {
        const parent = await this.prisma.comment.findUnique({
          where: { id: parentId },
          select: { depth: true, threadId: true, id: true }
        });

        if (!parent) {
          throw new NotFoundException(`Parent comment ${parentId} not found`);
        }

        depth = parent.depth + 1;
        threadId = parent.threadId || parent.id; // Use parent's thread or parent itself if root

        // Limit nesting depth
        if (depth > 10) {
          throw new BadRequestException('Maximum nesting depth exceeded');
        }
      }

      // Create the comment
      const comment = await this.prisma.comment.create({
        data: {
          postId,
          userId,
          content,
          parentId,
          threadId,
          depth
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              karma: {
                select: { totalKarma: true }
              }
            }
          },
          votes: true,
          awards: true
        }
      });

      // Update thread statistics
      if (threadId) {
        await this.updateCommentThread(threadId);
      } else if (depth === 0) {
        // Create thread for root comment
        await this.prisma.commentThread.create({
          data: {
            postId,
            rootCommentId: comment.id,
            depth: 0,
            commentCount: 1,
            lastActivityAt: new Date()
          }
        });
      }

      // Update user karma
      await this.updateUserKarma(userId, 'comment', 1);

      // Emit event for notifications
      this.eventEmitter.emit('comment.created', {
        commentId: comment.id,
        postId,
        parentId,
        authorId: userId,
        depth,
        timestamp: new Date()
      });

      return this.formatCommentWithReplies(comment, userId);

    } catch (error) {
      this.logger.error(`Error creating nested comment:`, error);
      throw error;
    }
  }

  /**
   * Get comments with nested structure
   */
  async getNestedComments(
    postId: string,
    userId?: string,
    sortBy: 'hot' | 'top' | 'new' | 'controversial' = 'hot',
    limit = 50
  ): Promise<CommentWithReplies[]> {
    try {
      // Get root comments (depth 0) with their children
      const comments = await this.prisma.comment.findMany({
        where: {
          postId,
          depth: 0
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              karma: {
                select: { totalKarma: true }
              }
            }
          },
          votes: true,
          awards: true,
          children: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                  karma: {
                    select: { totalKarma: true }
                  }
                }
              },
              votes: true,
              awards: true
            }
          }
        },
        take: limit
      });

      // Apply sorting
      const sortedComments = this.sortComments(comments, sortBy);

      // Format with nested structure
      const formattedComments = await Promise.all(
        sortedComments.map(comment => this.buildNestedCommentTree(comment, userId))
      );

      return formattedComments;

    } catch (error) {
      this.logger.error(`Error getting nested comments for post ${postId}:`, error);
      throw error;
    }
  }

  // ===== CONTENT REPORTING =====

  /**
   * Report content for moderation
   */
  async reportContent(dto: ReportDto): Promise<void> {
    const { contentId, contentType, reason, description, reporterId } = dto;

    try {
      // Check if user already reported this content
      const existingReport = await this.prisma.contentReport.findFirst({
        where: {
          reporterId,
          contentId,
          contentType
        }
      });

      if (existingReport) {
        throw new BadRequestException('You have already reported this content');
      }

      // Create the report
      await this.prisma.contentReport.create({
        data: {
          reporterId,
          contentType,
          contentId,
          reason,
          description
        }
      });

      // Emit event for moderator notifications
      this.eventEmitter.emit('content.reported', {
        contentId,
        contentType,
        reason,
        reporterId,
        timestamp: new Date()
      });

      this.logger.log(`Content reported: ${contentType} ${contentId} by user ${reporterId} for ${reason}`);

    } catch (error) {
      this.logger.error(`Error reporting content:`, error);
      throw error;
    }
  }

  // ===== SAVED CONTENT =====

  /**
   * Save/bookmark content
   */
  async saveContent(contentId: string, contentType: ContentType, userId: string): Promise<void> {
    try {
      await this.prisma.savedContent.upsert({
        where: {
          userId_contentType_contentId: {
            userId,
            contentType,
            contentId
          }
        },
        update: {},
        create: {
          userId,
          contentType,
          contentId
        }
      });

      this.logger.log(`Content saved: ${contentType} ${contentId} by user ${userId}`);

    } catch (error) {
      this.logger.error(`Error saving content:`, error);
      throw error;
    }
  }

  /**
   * Unsave/unbookmark content
   */
  async unsaveContent(contentId: string, contentType: ContentType, userId: string): Promise<void> {
    try {
      await this.prisma.savedContent.deleteMany({
        where: {
          userId,
          contentType,
          contentId
        }
      });

      this.logger.log(`Content unsaved: ${contentType} ${contentId} by user ${userId}`);

    } catch (error) {
      this.logger.error(`Error unsaving content:`, error);
      throw error;
    }
  }

  // ===== ENHANCED POST DATA =====

  /**
   * Get post with enhanced Reddit-like data
   */
  async getEnhancedPost(postId: string, userId?: string): Promise<PostWithEnhancedData> {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              karma: {
                select: { totalKarma: true }
              }
            }
          },
          votes: true,
          awards: true,
          _count: {
            select: { comments: true }
          }
        }
      });

      if (!post) {
        throw new NotFoundException(`Post ${postId} not found`);
      }

      const votes = this.calculateVoteCount(post.votes);
      const awards = this.aggregateAwards(post.awards);

      // Get user's vote and saved status
      let userVote: VoteType | undefined;
      let isSaved = false;
      let userAwards: AwardType[] = [];

      if (userId) {
        const userPostVote = post.votes.find(vote => vote.userId === userId);
        userVote = userPostVote?.voteType;

        const savedContent = await this.prisma.savedContent.findFirst({
          where: {
            userId,
            contentType: ContentType.POST,
            contentId: postId
          }
        });
        isSaved = !!savedContent;

        const userGivenAwards = post.awards.filter(award => award.userId === userId);
        userAwards = userGivenAwards.map(award => award.awardType);
      }

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        author: {
          id: post.user!.id,
          firstName: post.user!.firstName,
          lastName: post.user!.lastName,
          avatarUrl: post.user!.avatarUrl,
          karma: post.user!.karma?.totalKarma || 0
        },
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        votes,
        awards,
        commentCount: post._count.comments,
        userVote,
        userAwards,
        isSaved,
        canEdit: userId === post.userId,
        canDelete: userId === post.userId,
        canReport: userId !== post.userId
      };

    } catch (error) {
      this.logger.error(`Error getting enhanced post data for ${postId}:`, error);
      throw error;
    }
  }

  // ===== PRIVATE HELPER METHODS =====

  private async voteOnPost(postId: string, userId: string, voteType: VoteType): Promise<VoteCount> {
    await this.prisma.postVote.upsert({
      where: {
        postId_userId: {
          postId,
          userId
        }
      },
      update: { voteType },
      create: {
        postId,
        userId,
        voteType
      }
    });

    // Update author karma
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }
    });

    if (post?.userId) {
      const karmaChange = voteType === VoteType.UPVOTE ? 1 : -1;
      await this.updateUserKarma(post.userId, 'post', karmaChange);
    }

    return await this.getPostVoteCount(postId);
  }

  private async voteOnComment(commentId: string, userId: string, voteType: VoteType): Promise<VoteCount> {
    await this.prisma.commentVote.upsert({
      where: {
        commentId_userId: {
          commentId,
          userId
        }
      },
      update: { voteType },
      create: {
        commentId,
        userId,
        voteType
      }
    });

    // Update author karma
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true }
    });

    if (comment?.userId) {
      const karmaChange = voteType === VoteType.UPVOTE ? 1 : -1;
      await this.updateUserKarma(comment.userId, 'comment', karmaChange);
    }

    return await this.getCommentVoteCount(commentId);
  }

  private async getPostVoteCount(postId: string): Promise<VoteCount> {
    const votes = await this.prisma.postVote.findMany({
      where: { postId }
    });

    return this.calculateVoteCount(votes);
  }

  private async getCommentVoteCount(commentId: string): Promise<VoteCount> {
    const votes = await this.prisma.commentVote.findMany({
      where: { commentId }
    });

    return this.calculateVoteCount(votes);
  }

  private calculateVoteCount(votes: { voteType: VoteType }[]): VoteCount {
    const upvotes = votes.filter(v => v.voteType === VoteType.UPVOTE).length;
    const downvotes = votes.filter(v => v.voteType === VoteType.DOWNVOTE).length;
    return {
      upvotes,
      downvotes,
      score: upvotes - downvotes
    };
  }

  private async updateUserKarma(userId: string, type: 'post' | 'comment' | 'award', change: number): Promise<void> {
    try {
      await this.prisma.userKarma.upsert({
        where: { userId },
        update: {
          [type === 'post' ? 'postKarma' : type === 'comment' ? 'commentKarma' : 'awardKarma']: {
            increment: change
          },
          totalKarma: {
            increment: change
          },
          lastUpdated: new Date()
        },
        create: {
          userId,
          postKarma: type === 'post' ? change : 0,
          commentKarma: type === 'comment' ? change : 0,
          awardKarma: type === 'award' ? change : 0,
          totalKarma: change
        }
      });
    } catch (error) {
      this.logger.error(`Error updating karma for user ${userId}:`, error);
    }
  }

  private isPremiumAward(awardType: AwardType): boolean {
    return [AwardType.GOLD, AwardType.PLATINUM].includes(awardType);
  }

  private async validatePremiumAwardEligibility(userId: string, awardType: AwardType): Promise<void> {
    // This could check user's coin balance or subscription status
    // For now, just check if user has enough karma
    const userKarma = await this.prisma.userKarma.findUnique({
      where: { userId }
    });

    const requiredKarma = awardType === AwardType.PLATINUM ? 1000 : 500;
    if (!userKarma || userKarma.totalKarma < requiredKarma) {
      throw new BadRequestException(`Insufficient karma to give ${awardType} award`);
    }
  }

  private getAwardKarmaValue(awardType: AwardType): number {
    const awardValues = {
      [AwardType.HELPFUL]: 5,
      [AwardType.SUPPORTIVE]: 5,
      [AwardType.INSPIRING]: 10,
      [AwardType.FUNNY]: 5,
      [AwardType.GOLD]: 25,
      [AwardType.PLATINUM]: 50,
      [AwardType.COMMUNITY]: 10
    };
    return awardValues[awardType] || 5;
  }

  private async updateCommentThread(threadId: string): Promise<void> {
    try {
      const commentCount = await this.prisma.comment.count({
        where: { threadId }
      });

      await this.prisma.commentThread.update({
        where: { id: threadId },
        data: {
          commentCount,
          lastActivityAt: new Date()
        }
      });
    } catch (error) {
      this.logger.error(`Error updating comment thread ${threadId}:`, error);
    }
  }

  private formatCommentWithReplies(comment: any, userId?: string): CommentWithReplies {
    const votes = this.calculateVoteCount(comment.votes || []);
    const awards = this.aggregateAwards(comment.awards || []);
    const userVote = userId ? comment.votes?.find((v: any) => v.userId === userId)?.voteType : undefined;

    return {
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.user.id,
        firstName: comment.user.firstName,
        lastName: comment.user.lastName,
        avatarUrl: comment.user.avatarUrl,
        karma: comment.user.karma?.totalKarma || 0
      },
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      depth: comment.depth || 0,
      votes,
      awards,
      children: [],
      userVote,
      canEdit: userId === comment.userId,
      canDelete: userId === comment.userId,
      canReport: userId !== comment.userId
    };
  }

  private async buildNestedCommentTree(comment: any, userId?: string): Promise<CommentWithReplies> {
    const formatted = this.formatCommentWithReplies(comment, userId);

    if (comment.children && comment.children.length > 0) {
      formatted.children = await Promise.all(
        comment.children.map((child: any) => this.buildNestedCommentTree(child, userId))
      );
    }

    return formatted;
  }

  private sortComments(comments: any[], sortBy: string): any[] {
    switch (sortBy) {
      case 'hot':
        return comments.sort((a, b) => this.calculateHotScore(b) - this.calculateHotScore(a));
      case 'top':
        return comments.sort((a, b) => this.calculateVoteCount(b.votes).score - this.calculateVoteCount(a.votes).score);
      case 'new':
        return comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'controversial':
        return comments.sort((a, b) => this.calculateControversyScore(b) - this.calculateControversyScore(a));
      default:
        return comments;
    }
  }

  private calculateHotScore(comment: any): number {
    const votes = this.calculateVoteCount(comment.votes || []);
    const age = (Date.now() - comment.createdAt.getTime()) / (1000 * 60 * 60); // hours
    return votes.score / Math.pow(age + 2, 1.5);
  }

  private calculateControversyScore(comment: any): number {
    const votes = this.calculateVoteCount(comment.votes || []);
    if (votes.upvotes + votes.downvotes === 0) return 0;
    return Math.min(votes.upvotes, votes.downvotes) / Math.max(votes.upvotes, votes.downvotes);
  }

  private aggregateAwards(awards: any[]): { type: AwardType; count: number; isAnonymous: boolean; message?: string }[] {
    const awardMap = new Map<AwardType, { count: number; messages: string[]; hasAnonymous: boolean }>();

    awards.forEach(award => {
      const existing = awardMap.get(award.awardType) || { count: 0, messages: [], hasAnonymous: false };
      existing.count++;
      if (award.message) existing.messages.push(award.message);
      if (award.isAnonymous) existing.hasAnonymous = true;
      awardMap.set(award.awardType, existing);
    });

    return Array.from(awardMap.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      isAnonymous: data.hasAnonymous,
      message: data.messages.length > 0 ? data.messages.join('; ') : undefined
    }));
  }
}