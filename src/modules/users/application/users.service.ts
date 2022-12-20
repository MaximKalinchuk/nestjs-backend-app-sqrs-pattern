import { Injectable } from '@nestjs/common';
import { UsersEntity } from '../domain/entity/users.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserViewModel } from './dto/createUser-view-model.dto';

@Injectable()
export class UsersService {

    constructor(private readonly usersRepository: UsersRepository,) {}

    async updateUserInDataBase(userData: UsersEntity): Promise<UsersEntity> {
        return await this.usersRepository.updateUserInDataBase(userData)
    }

    buildResponse(user: UsersEntity): CreateUserViewModel {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            password: user.password,
            banned: user.banned,
            BanReason: user.BanReason,
            userRoles: user.userRoles
        }
    }
}
