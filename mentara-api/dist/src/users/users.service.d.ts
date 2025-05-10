import { PrismaService } from 'src/providers/prisma-client.provider';
import { User, Prisma } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User | null>;
    create(data: Prisma.UserCreateInput): Promise<User>;
    update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
    remove(id: string): Promise<User>;
    isFirstSignIn(userId: string): Promise<boolean>;
}
