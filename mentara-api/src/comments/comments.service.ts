import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { Comment, Prisma } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      include: {
        post: true,
      },
    });
  }

  async findOne(id: string): Promise<Comment | null> {
    return this.prisma.comment.findUnique({
      where: { id },
      include: {
        post: true,
      },
    });
  }

  async create(data: Prisma.CommentCreateInput): Promise<Comment> {
    return this.prisma.comment.create({
      data,
      include: {
        post: true,
      },
    });
  }

  async update(id: string, data: Prisma.CommentUpdateInput): Promise<Comment> {
    return this.prisma.comment.update({
      where: { id },
      data,
      include: {
        post: true,
      },
    });
  }

  async remove(id: string): Promise<Comment> {
    return this.prisma.comment.delete({
      where: { id },
    });
  }
}
