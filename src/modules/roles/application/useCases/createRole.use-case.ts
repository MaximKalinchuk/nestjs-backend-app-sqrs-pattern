import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateRoleInputModel } from "../../api/models/createRole.model";
import { RolesEntity } from "../../domain/entity/roles.entity";
import { RolesRepository } from "../../intarface/roles.repository";
import { CreateRoleViewModel } from "../dto/createRole-view-model.dto";
import { CommandHandler } from '@nestjs/cqrs';
import { ICommandHandler } from '@nestjs/cqrs/dist';


export class CreateRoleCommand {
    constructor(public roleData: CreateRoleInputModel) {}
}

@CommandHandler(CreateRoleCommand)
export class CreateRoleUseCase implements ICommandHandler<CreateRoleCommand> {
    constructor(private readonly rolesRepository: RolesRepository) {}

    async execute(command: CreateRoleCommand): Promise<CreateRoleViewModel> {

        const { roleData } = command
        const roleByName = await this.rolesRepository.getRoleByName(roleData.role)

        if (roleByName) {
            throw new HttpException('Такая роль уже добавлена', HttpStatus.BAD_REQUEST)
        }
        const newRole = new RolesEntity()
        Object.assign(newRole, roleData)

        return await this.rolesRepository.createRole(roleData)
    }
}