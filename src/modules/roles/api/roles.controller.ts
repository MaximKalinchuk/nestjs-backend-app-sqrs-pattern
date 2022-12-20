import { Body, Controller, Post } from '@nestjs/common';
import { CreateRoleViewModel } from '../application/dto/createRole-view-model.dto';
import { RolesService } from '../application/roles.service';
import { CreateRoleCommand, CreateRoleUseCase } from '../application/useCases';
import { CreateRoleInputModel } from './models/createRole.model';
import { CommandBus } from '@nestjs/cqrs/dist';

@Controller('roles')
export class RolesController {

    constructor(private readonly commandBus: CommandBus) {}

    @Post()
    async createRole(@Body() roleData: CreateRoleInputModel): Promise<CreateRoleViewModel> {
        return await this.commandBus.execute(new CreateRoleCommand(roleData))
    }
}
