import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma-client.provider';
import { Post, Prisma } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Post[]> {
    return this.prisma.post.findMany({
      include: {
        author: true,
        community: true,
      },
    });
  }

  async findOne(id: string): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        community: true,
        comments: true,
      },
    });
  }

  async create(data: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.post.create({
      data,
      include: {
        author: true,
        community: true,
      },
    });
  }

  async update(id: string, data: Prisma.PostUpdateInput): Promise<Post> {
    return this.prisma.post.update({
      where: { id },
      data,
      include: {
        author: true,
        community: true,
      },
    });
  }

  async remove(id: string): Promise<Post> {
    return this.prisma.post.delete({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<Post[]> {
    return this.prisma.post.findMany({
      where: {
        authorId: userId,
      },
      include: {
        author: true,
        community: true,
      },
    });
  }

  async findByCommunityId(communityId: string): Promise<Post[]> {
    return this.prisma.post.findMany({
      where: {
        communityId,
      },
      include: {
        author: true,
        community: true,
      },
    });
  }
}
