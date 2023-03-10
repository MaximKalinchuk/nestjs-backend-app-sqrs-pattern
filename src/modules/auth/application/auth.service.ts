import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterUserViewModel } from './dto/registerUser-view-model.dto';
import { UsersService } from '../../users/application/users.service';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { Tokens } from './dto/tokens-view-model.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {

    constructor(private readonly usersService: UsersService,
                private readonly jwtService: JwtService,
                private readonly configService: ConfigService) {}

    async decodeToken(token: string) {
        try {
            const user = await this.jwtService.verify(token, {
                secret: process.env.PRIVATE_REFRESH_KEY
            })
            return user;
        } catch (err) {
            console.log(err)
            throw new UnauthorizedException()
        }
    }

    async generateToken(user: RegisterUserViewModel) {
        
        const payload = { id: user.id, username: user.username, email: user.email, roles: user.userRoles}
            const access_token = await this.jwtService.sign({payload}, {
                secret:  this.configService.get<string>('PRIVATE_ACCESS_KEY'),
                expiresIn: '15m'
            })
            const refresh_token = await this.jwtService.sign({payload}, {
                secret:  this.configService.get<string>('PRIVATE_REFRESH_KEY'),
                expiresIn: '168h'
            })

        return {
            access_token,
            refresh_token
        }
    }

    async updateRefreshTokenInDataBase(user, tokens: Tokens) {
        const hashToken = await hash(tokens.refresh_token, 10)
        await this.usersService.updateUserInDataBase({...user, refresh_token: hashToken})
    }

}
