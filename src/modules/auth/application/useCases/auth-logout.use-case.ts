import { UnauthorizedException } from "@nestjs/common";
import { SessionsService } from "../../../../modules/sessions/application/sessions.service";
import { UsersService } from "../../../../modules/users/application/users.service";
import { UsersRepository } from "../../../../modules/users/infrastructure/users.repository";
import { AuthsQueryRepository } from "../../api/queryRepository/auth.query.repository";
import { AuthService } from "../auth.service";
import { CommandHandler } from '@nestjs/cqrs';
import { ICommandHandler } from '@nestjs/cqrs/dist';

export class AuthLogoutCommand {
    constructor(public token: string) {}
}

@CommandHandler(AuthLogoutCommand)
export class AuthLogoutUseCase implements ICommandHandler<AuthLogoutCommand>{
    constructor(private readonly usersService: UsersService,
                private readonly authService: AuthService,
                private readonly usersRepository: UsersRepository,
                private readonly sessionsService: SessionsService,
                private readonly authsQueryRepository: AuthsQueryRepository,) {}

    async execute(command: AuthLogoutCommand): Promise<void> {
        const { token } = command
        await this.authsQueryRepository.checkTokenInDataBase(token)
        const userFromRequest = await this.authService.decodeToken(token)
        const user = await this.usersRepository.getUserWithRolesById(userFromRequest.payload.id);
        if (!user) {
            throw new UnauthorizedException('Такого пользователя не существует')
        }

        const userWithoutRefreshToken = { ...user, refresh_token: null}
        await this.usersService.updateUserInDataBase(userWithoutRefreshToken)
        await this.sessionsService.saveUsedToken(token)
    }
}