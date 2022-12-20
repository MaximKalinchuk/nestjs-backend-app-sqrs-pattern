import { Injectable } from '@nestjs/common';
import { CreateUserViewModel } from '../../application/dto/createUser-view-model.dto';
import { UsersRepository } from '../../infrastructure/users.repository';

@Injectable()
export class UsersQueryRepository {

    constructor(private readonly usersRepository: UsersRepository) {}
    async getUserByEmail(email: string): Promise<CreateUserViewModel> {
        return this.usersRepository.getUserByEmail(email)
    }

    async getUserByUsername(username: string): Promise<CreateUserViewModel> {
        return this.usersRepository.getUserByUsername(username)
    }
}