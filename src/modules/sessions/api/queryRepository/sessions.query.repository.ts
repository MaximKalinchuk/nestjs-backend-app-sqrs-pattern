import { Injectable } from "@nestjs/common";
import { SessionsEntity } from "../../domain/entity/sessions.entity";
import { SessionsRepository } from "../../infrastructure/session.repository";


@Injectable()
export class SessionsQueryRepository {

    constructor(private readonly sessionsRepository: SessionsRepository) {}

    async findUsedToken(token: string): Promise<SessionsEntity> {
        return await this.sessionsRepository.findUsedToken(token)
    }
}
