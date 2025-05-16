import { UsersService } from './users.service';
import { User, Prisma } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    create(userData: Prisma.UserCreateInput): Promise<User>;
    update(id: string, userData: Prisma.UserUpdateInput): Promise<User>;
    remove(id: string): Promise<User>;
    isFirstSignIn(userId: string): Promise<{
        isFirstSignIn: boolean;
    }>;
}
