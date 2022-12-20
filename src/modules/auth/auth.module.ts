import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { AuthController } from './api/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { SessionsModule } from '../sessions/sessions.module';
import { AuthLoginUseCase, AuthLogoutUseCase, AuthRefreshUseCase, AuthRegisterUseCase } from './application/useCases';
import { AuthsQueryRepository } from './api/queryRepository/auth.query.repository';
import { CqrsModule } from '@nestjs/cqrs/dist';

const useCases = [
  AuthLoginUseCase,
  AuthLogoutUseCase,
  AuthRefreshUseCase,
  AuthRegisterUseCase,
]

const adapters = [
  AuthsQueryRepository
]

@Module({
  imports: [
    SessionsModule,
    UsersModule, 
    JwtModule.register({}),
    CqrsModule,
],
  controllers: [AuthController],
  providers: [AuthService, ...adapters, ...useCases],
  exports: [JwtModule, AuthService, AuthsQueryRepository],
})
export class AuthModule {}
