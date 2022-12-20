import { RolesRepository } from '../../../../modules/roles/intarface/roles.repository';
import { CreateUserInputModel } from '../../api/models/createUser.model';
import { UsersEntity } from '../../domain/entity/users.entity';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CreateUserViewModel } from '../dto/createUser-view-model.dto';
import { UsersService } from '../users.service';
import { CommandHandler } from '@nestjs/cqrs';
import { ICommandHandler } from '@nestjs/cqrs/dist';

export class CreateUserCommnad {
    constructor(public userData: CreateUserInputModel) {}
}

@CommandHandler(CreateUserCommnad)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommnad>{
    constructor(private readonly usersRepository: UsersRepository,
                private readonly rolesRepository: RolesRepository,
                private readonly usersService: UsersService) {}

    async execute(command: CreateUserCommnad): Promise<CreateUserViewModel> {
        const { userData } = command
        const newUser = new UsersEntity()
        Object.assign(newUser, userData)
        const userFromDataBase = await this.usersRepository.createUsers(newUser)
        const userWithRoles = await this.usersRepository.getUserWithRolesById(userFromDataBase.id)
        const roleByName = await this.rolesRepository.getRoleByName('USER')
  
        userWithRoles.userRoles.push(roleByName)
        const updateUserWithRoles = await this.usersRepository.createUsers(userWithRoles)

        return this.usersService.buildResponse(updateUserWithRoles);
    }
}