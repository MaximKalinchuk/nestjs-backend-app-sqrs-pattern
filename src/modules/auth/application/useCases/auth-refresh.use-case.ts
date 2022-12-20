import { UnauthorizedException } from "@nestjs/common";
import { SessionsService } from "../../../../modules/sessions/application/sessions.service";
import { UsersRepository } from "../../../../modules/users/infrastructure/users.repository";
import { AuthService } from "../auth.service";
import { Tokens } from "../dto/tokens-view-model.dto";
import { compare } from 'bcryptjs';
import { AuthsQueryRepository } from "../../api/queryRepository/auth.query.repository";
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';


export class AuthRefreshCommand {
    constructor(public token: string) {}
}

@CommandHandler(AuthRefreshCommand)
export class AuthRefreshUseCase implements ICommandHandler<AuthRefreshCommand> {
    constructor(private readonly authService: AuthService,
                private readonly usersRepository: UsersRepository,
                private readonly sessionsService: SessionsService,
                private readonly authsQueryRepository: AuthsQueryRepository,) {}

    async execute(command: AuthRefreshCommand): Promise<Tokens> {
        const { token } = command
        await this.authsQueryRepository.checkTokenInDataBase(token)
        
        const userFromRequest = await this.authService.decodeToken(token)
        const user = await this.usersRepository.getUserWithRolesById(userFromRequest.payload.id);
        

        if (!user) {
            throw new UnauthorizedException('Такого пользователя не существует')
        }


        const isRefreshTokensEquel = await compare(token, user.refresh_token)
        if(!isRefreshTokensEquel) {
            throw new UnauthorizedException('Токены не совпадают')
        }
        const tokens = await this.authService.generateToken(user);

        await this.authService.updateRefreshTokenInDataBase(user, tokens)
        await this.sessionsService.saveUsedToken(token)

        return tokens
    }
}