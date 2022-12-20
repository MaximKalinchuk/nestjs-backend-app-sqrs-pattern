import { Body, Controller, Get, Post, UseGuards, HttpCode, Req } from '@nestjs/common';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CreateUserViewModel } from '../application/dto/createUser-view-model.dto';
import { BanUserInputModel } from './models/banUser.model';
import { CreateUserInputModel } from './models/createUser.model';
import { giveRoleToUserInputModel } from './models/giveRoleToUser.model';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CreateUserUseCase, CreateUserCommnad } from '../application/useCases/createUser.use-case';
import { GiveBanCommand, GiveBanUseCase } from '../application/useCases/giveBan.use-case';
import { GiveRoleUseCase, GiveRoleCommand } from '../application/useCases/giveRole.use-case';
import { GetUsersCommand, GetUsersUseCase } from '../application/useCases/getUsers.use-case';
import { Request } from 'express';
import { AuthsQueryRepository } from '../../../modules/auth/api/queryRepository/auth.query.repository';
import { CommandBus } from '@nestjs/cqrs/dist';


@Controller('users')
export class UsersController {

    constructor(private readonly authsQueryRepository: AuthsQueryRepository,
                private readonly commandBus: CommandBus) {}
    @HttpCode(201)
    @Post()
    async createUser(@Body() userData: CreateUserInputModel): Promise<CreateUserViewModel>{
        return await this.commandBus.execute(new CreateUserCommnad(userData))
    }

    @HttpCode(200)
    @Get()
    async getUsers(@Req() req: Request): Promise<CreateUserViewModel[]> {
        const refresh_token = req.cookies.refresh_token
        await this.authsQueryRepository.checkTokenInDataBase(refresh_token)
        return await this.commandBus.execute(new GetUsersCommand())
    }

    @HttpCode(200)
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Post('/ban')
    async giveBan(@Body() userData: BanUserInputModel): Promise<CreateUserViewModel>{
        return await this.commandBus.execute(new GiveBanCommand(userData))
    }

    @HttpCode(200)
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Post('/role')
    async role(@Body() userData: giveRoleToUserInputModel): Promise<CreateUserViewModel> {
        return await this.commandBus.execute(new GiveRoleCommand(userData))
    }
}
