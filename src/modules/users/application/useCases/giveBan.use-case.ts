import { HttpException, HttpStatus } from '@nestjs/common';
import { BanUserInputModel } from '../../api/models/banUser.model';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CreateUserViewModel } from '../dto/createUser-view-model.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs/dist';

export class GiveBanCommand {
    constructor(public userData: BanUserInputModel) {}
}

@CommandHandler(GiveBanCommand)
export class GiveBanUseCase implements ICommandHandler<GiveBanCommand> {
    constructor(private readonly usersRepository: UsersRepository) {}

    async execute(command: GiveBanCommand): Promise<CreateUserViewModel> {
        const { userData } = command
        const user = await this.usersRepository.getUserByUsername(userData.username);

        if(!user) {
            throw new HttpException('Такой пользователь не найден', HttpStatus.BAD_REQUEST)
        }

        const updateUser = {...user, banned: true, BanReason: userData.BanReason}

        return await this.usersRepository.createUsers(updateUser)
    }
}