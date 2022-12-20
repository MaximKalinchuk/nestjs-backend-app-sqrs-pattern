import { UnauthorizedException } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs/dist'
import { LoginUserInputModel } from "../../api/models/loginUser.model";
import { AuthService } from "../auth.service";
import { Tokens } from "../dto/tokens-view-model.dto";
import { compare } from 'bcryptjs';
import { UsersRepository } from "../../../../modules/users/infrastructure/users.repository";
import { SessionsService } from "../../../../modules/sessions/application/sessions.service";
import { CreateUserViewModel } from "../../../../modules/users/application/dto/createUser-view-model.dto";

export class AuthLoginCommand {
    constructor(public userData: LoginUserInputModel, public userByEmail: CreateUserViewModel) {}
}
@CommandHandler(AuthLoginCommand)
export class AuthLoginUseCase implements ICommandHandler<AuthLoginCommand> {
    constructor(private readonly authService: AuthService,
                private readonly usersRepository: UsersRepository,
                private readonly sessionsService: SessionsService,) {}

    async execute(command: AuthLoginCommand): Promise<Tokens> {

        const { userData, userByEmail } = command

        if (!userByEmail) {
            throw new UnauthorizedException('Такого пользователя не существует')
        }

        const isPasswordEquil = await compare(userData.password, userByEmail.password)

        if (!isPasswordEquil) {
            throw new UnauthorizedException('Неверный пароль')
        }
        const user = await this.usersRepository.getUserWithRolesById(userByEmail.id);

        const tokens = await this.authService.generateToken(user)

        await this.authService.updateRefreshTokenInDataBase(user, tokens)

        if (user.refresh_token) {
            await this.sessionsService.saveUsedToken(user.refresh_token)
        }

        return tokens
    }
}