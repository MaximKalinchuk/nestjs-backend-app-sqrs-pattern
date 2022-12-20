import { UsersRepository } from "../../infrastructure/users.repository";
import { CreateUserViewModel } from "../dto/createUser-view-model.dto";
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs/dist';


export class GetUsersCommand {
    constructor() {}
}

@CommandHandler(GetUsersCommand)
export class GetUsersUseCase implements ICommandHandler<GetUsersCommand> {
    constructor(private readonly usersRepository: UsersRepository,) {}

    async execute(): Promise<CreateUserViewModel[]> {
            return this.usersRepository.getUsers()
        }
}