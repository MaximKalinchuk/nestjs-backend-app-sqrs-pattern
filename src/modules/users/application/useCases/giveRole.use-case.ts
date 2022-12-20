import { HttpException, HttpStatus } from '@nestjs/common';
import { RolesRepository } from '../../../../modules/roles/intarface/roles.repository';
import { giveRoleToUserInputModel } from '../../api/models/giveRoleToUser.model';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CreateUserViewModel } from '../dto/createUser-view-model.dto';
import { UsersService } from '../users.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs/dist';

export class GiveRoleCommand {
    constructor(public userData: giveRoleToUserInputModel) {}
}

@CommandHandler(GiveRoleCommand)
export class GiveRoleUseCase implements ICommandHandler<GiveRoleCommand> {
    constructor(private readonly usersRepository: UsersRepository,
                private readonly rolesRepository: RolesRepository,
                private readonly usersService: UsersService) {}

    async execute(command: GiveRoleCommand): Promise<CreateUserViewModel> {
        const { userData } = command
        const user = await this.usersRepository.getUserByUsername(userData.username);
        const role = await this.rolesRepository.getRoleByName(userData.rolename);

        if(!user) {
            throw new HttpException('Такой пользователь не найден', HttpStatus.BAD_REQUEST)
        }

        if(!role) {
            throw new HttpException('Такой роли не существует', HttpStatus.BAD_REQUEST)
        }

        user.userRoles.filter((role) => {
            if (role.role === userData.rolename) {
                throw new HttpException('Такая роль уже добавлена', HttpStatus.BAD_REQUEST)
            }
        })

        user.userRoles.push(role)
        const updateUserWithRoles = await this.usersRepository.createUsers(user)
        return this.usersService.buildResponse(updateUserWithRoles)
    }
}