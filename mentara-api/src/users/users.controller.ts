import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { ClerkAuthGuard } from 'src/clerk-auth.guard';
import { Public } from 'src/decorators/public.decorator';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(ClerkAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    try {
      return await this.usersService.findAll();
    } catch (error: unknown) {
      throw new HttpException(
        `Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Body() userData: Prisma.UserCreateInput): Promise<User> {
    try {
      return await this.usersService.create(userData);
    } catch (error) {
      throw new HttpException(
        `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() userData: Prisma.UserUpdateInput,
  ): Promise<User> {
    try {
      return await this.usersService.update(id, userData);
    } catch (error) {
      throw new HttpException(
        `Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<User> {
    try {
      return await this.usersService.remove(id);
    } catch (error) {
      throw new HttpException(
        `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Get('is-first-signin/:userId')
  async isFirstSignIn(
    @Param('userId') userId: string,
  ): Promise<{ isFirstSignIn: boolean }> {
    try {
      const isFirstSignIn = await this.usersService.isFirstSignIn(userId);
      return { isFirstSignIn };
    } catch (error) {
      throw new HttpException(
        `Failed to check first sign in: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
