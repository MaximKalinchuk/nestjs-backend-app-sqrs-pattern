import { RegisterUserInputModel } from "../../api/models/registerUser.model";
import { Tokens } from "../dto/tokens-view-model.dto";
import { hash } from 'bcryptjs';
import { AuthService } from '../auth.service';
import { CreateUserUseCase } from "../../../../modules/users/application/useCases";
import { ICommandHandler, CommandBus } from '@nestjs/cqrs/dist';
import { CommandHandler } from '@nestjs/cqrs';
import { CreateUserCommnad } from '../../../users/application/useCases/createUser.use-case';

export class AuthRegisterCommand {
    constructor(public userData: RegisterUserInputModel) {}
}
@CommandHandler(AuthRegisterCommand)
export class AuthRegisterUseCase implements ICommandHandler<AuthRegisterCommand> {
    constructor(private readonly authService: AuthService,
                private readonly commandBus: CommandBus,) {}

    async execute(command: AuthRegisterCommand): Promise<Tokens> {

        const { userData } = command

        const hashPassword = await hash(userData.password, 5)
        const user = await this.commandBus.execute(new CreateUserCommnad({...userData, password: hashPassword}))

        const tokens = await this.authService.generateToken(user)

        this.authService.updateRefreshTokenInDataBase(user, tokens)

        return tokens;
    }
}