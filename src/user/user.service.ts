import { ConflictException, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignInDto, SignInToken, SignUpDto, SignUpResponseDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        private readonly jwtService: JwtService
    ) {}

    // 회원가입
    async signUp(signUpDto:SignUpDto): Promise<any> {
        // id 중복 검사
        const inputUserId:string = signUpDto.userId;
        const notUniqueId:UserEntity|null = await this.userRepo.findOne(
            {
                where: {userId: inputUserId}
            }
        )
        if (notUniqueId) {
            throw new ConflictException('이미 존재하는 아이디입니다.')
        }

        // email 중복검사
        const inputEmail:string = signUpDto.email;
        const notUniqueMail:UserEntity|null = await this.userRepo.findOne(
            {
                where: {email: inputEmail},
            }
        );
        if (notUniqueMail) {
            throw new ConflictException('이미 존재하는 메일입니다.');
        }

        // 비밀번호 복호화
        const originalPassword:string = signUpDto.password;
        const hashedPassword:string = await bcrypt.hash(originalPassword, 5);
        signUpDto.password = hashedPassword;
        
        const result = await this.userRepo.save(signUpDto)
        //console.log(result)

        return new SignUpResponseDto()
    }

    // 로그인
    async signIn(signInDto : SignInDto): Promise<any> {
        const inputUserId = signInDto.userId
        const inputPassword = signInDto.password
        const user:UserEntity|null = await this.userRepo.findOne({
            where: {userId: inputUserId}
        });

        let isValid:boolean = false;

        if (user) {
            isValid = await bcrypt.compare(
                inputPassword,
                user.password
            )
        }

        if (isValid) {
            const access = this.getAccessToken(user)
            const refresh = this.getRefeshToken(user)
            // refresh 토큰 저장
            await this.userRepo.update(
                user.userUid,
                {refreshToken: refresh}
            )
            return new SignInToken(access, refresh)
        // 유저가 존재하지 않거나 비밀번호가 일치하지 않을 때
        } else {
            throw new UnauthorizedException("아이디 혹은 비밀번호가 올바르지 않습니다.");
        }
    }

    // 토큰 갱신
    async refreshToken(request: any) {
        try {
            const cookies:string[] = request.cookies;
            let refreshToken = null;
            for (let i=0; i++; i<=cookies.length-1) {
                if (cookies[i].includes("refresh_token")) {
                    refreshToken = cookies[i].replace("refresh_token=","")
                    break
                }
            };

            const decoded = this.jwtService.decode(refreshToken);
            const userUid = decoded.userUid

            const user:UserEntity|null = await this.userRepo.findOne({
                where: {userUid : userUid}
            })

            if (user) {
                const accessToken = this.getAccessToken(user);
                return new SignInToken(accessToken, user.refreshToken)
            }
        } catch(e) {
            switch(e.message) {
                case "INVALID_TOKEN":
                case "TOKEN_IS_ARRAY":
                case "NO_USER":
                    throw new HttpException("유효한 접근이 아닙니다.", 401)

                case "EXPIRED_TOKEN":
                    throw new HttpException("토큰이 만료되었습니다.", 441)

                default:
                    throw new HttpException('처리 중에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.', 500);
            }
        }
    }

    async getUser(userUid:number):Promise<UserEntity>|null {
        return await this.userRepo.findOne({
            where: {
                userUid: userUid
            }
        })
    }
    

    getAccessToken(user:UserEntity):string {
        return this.jwtService.sign(
            {
                userUid: user.userUid
            },
            {
                secret: process.env.SECRET_FOR_ACCESS_TOKEN,
                expiresIn: '3m'
            }
        )
    }

    getRefeshToken(user:UserEntity):string {
        return this.jwtService.sign(
            {
                userUid: user.userUid
            },
            {
                secret: process.env.SECRET_FOR_ACCESS_TOKEN,
                expiresIn: '1d'
            }
        )
    }
}
