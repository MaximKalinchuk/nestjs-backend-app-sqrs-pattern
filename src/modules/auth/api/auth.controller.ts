import { Body, Controller, HttpCode, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { Tokens } from '../application/dto/tokens-view-model.dto';
import { LoginUserInputModel } from './models/loginUser.model';
import { RegisterUserInputModel } from './models/registerUser.model';
import { Public } from '../../../common/decorators/public.decorator';
import { AuthLoginCommand, AuthLoginUseCase, AuthLogoutCommand, AuthLogoutUseCase, AuthRefreshCommand, AuthRefreshUseCase, AuthRegisterCommand, AuthRegisterUseCase } from '../application/useCases';
import { UsersQueryRepository } from '../../../modules/users/api/queryRepository/user.query.repository';
import { CommandBus } from '@nestjs/cqrs/dist';

@Controller()
export class AuthController {

    constructor(private readonly usersQueryRepository: UsersQueryRepository,
                private readonly commandBus: CommandBus) {}

    @Public()
    @HttpCode(201)
    @Post('register')
    async register(@Body() userData: RegisterUserInputModel, @Res({passthrough: true}) res: Response): Promise<Omit<Tokens, "refresh_token">> {
        const userByEmail = await this.usersQueryRepository.getUserByEmail(userData.email)
        const userByUsername = await this.usersQueryRepository.getUserByUsername(userData.username)

        if(userByEmail) {
            throw new UnauthorizedException('Такой email уже зарегистрирован')
        }

        if(userByUsername) {
            throw new UnauthorizedException('Такой username уже занят')
        }
        const tokens = await this.commandBus.execute(new AuthRegisterCommand(userData))
        res.cookie('refresh_token', tokens.refresh_token, {
            maxAge: 4000 * 1000,
            httpOnly: true
        })
        return {
            access_token: tokens.access_token
        }
    }

    @Public()
    @HttpCode(200)
    @Post('login')
    async login(@Body() userData: LoginUserInputModel, @Res({passthrough: true}) res: Response): Promise<Omit<Tokens, "refresh_token">> {
        const userByEmail = await this.usersQueryRepository.getUserByEmail(userData.email)
        const tokens = await this.commandBus.execute(new AuthLoginCommand(userData, userByEmail) )
        res.cookie('refresh_token', tokens.refresh_token, {
            maxAge: 3600 * 24 * 30,
            httpOnly: true
        })
        return {
            access_token: tokens.access_token
        }
    }


    @Public()
    @HttpCode(200)
    @Post('refresh')
    async refresh(@Req() req: Request, @Res({passthrough: true}) res: Response): Promise<Omit<Tokens, "refresh_token">> {
        const refresh_token = req.cookies.refresh_token
        const tokens = await this.commandBus.execute(new AuthRefreshCommand(refresh_token));
        res.cookie('refresh_token', tokens.refresh_token, {
            maxAge: 3600 * 24 * 30,
            httpOnly: true
        })
        return {
            access_token: tokens.access_token
        }
    }

    
    @Public()
    @HttpCode(200)
    @Post('logout')
    async logout(@Req() req: Request, @Res({passthrough: true}) res: Response): Promise<string> {
        const refresh_token = req.cookies.refresh_token
        await this.commandBus.execute(new AuthLogoutCommand(refresh_token))
        res.clearCookie('refresh_token')
        return 'Вы успешно вышли из системы.'
    }
}
