import { Module } from '@nestjs/common';
import { RolesService } from './application/roles.service';
import { RolesController } from './api/roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesEntity } from './domain/entity/roles.entity';
import { RolesRepository } from './intarface/roles.repository';
import { CreateRoleUseCase } from './application/useCases/createRole.use-case';
import { CqrsModule } from '@nestjs/cqrs';

const useCase = [
  CreateRoleUseCase
]

@Module({
  imports: [TypeOrmModule.forFeature([RolesEntity]), CqrsModule],
  providers: [RolesService, RolesRepository, ...useCase],
  controllers: [RolesController],
  exports: [RolesRepository]
})
export class RolesModule {}
