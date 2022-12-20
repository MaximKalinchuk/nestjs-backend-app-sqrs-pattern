import { Injectable, UnauthorizedException } from "@nestjs/common";
import { SessionsQueryRepository } from '../../../sessions/api/queryRepository/sessions.query.repository';


@Injectable()
export class AuthsQueryRepository {
    constructor(private readonly sessionsQueryRepository: SessionsQueryRepository) {}

    async checkTokenInDataBase(token: string): Promise<void> {
        const hasToken = await this.sessionsQueryRepository.findUsedToken(token)
        if (hasToken) {
            throw new UnauthorizedException()
        }
    }

}