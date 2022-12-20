import { Module } from '@nestjs/common';
import { SessionsService } from './application/sessions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsEntity } from './domain/entity/sessions.entity';
import { SessionsRepository } from './infrastructure/session.repository';
import { SessionsQueryRepository } from './api/queryRepository/sessions.query.repository';

const adapters = [
  SessionsQueryRepository,
  SessionsRepository
]

@Module({
  imports: [TypeOrmModule.forFeature([SessionsEntity])],
  providers: [SessionsService, ...adapters],
  exports: [SessionsService, SessionsQueryRepository],
})
export class SessionsModule {}
