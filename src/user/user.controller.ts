import { Response, Request } from 'express';
import { Body, Controller, Get, HttpException, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SignInDto, SignInResponseDTO, SignInToken, SignUpDto } from './dto/user.dto';
import { EnterGuard } from 'guards/enter.guard';

@Controller('/auth')
export class UserController {
    constructor (
        private readonly userService: UserService
    ) {}

    @Post('/signup')
    async signUp(@Body() signUpDto : SignUpDto) {
        return await this.userService.signUp(signUpDto);
    }

    @Post('/signin')
    async signIn(
        @Body() signInDto : SignInDto,
        @Res({passthrough: true}) response: Response
    ) {
        const signInRes:SignInToken|UnauthorizedException =  await this.userService.signIn(signInDto)
        if (signInRes instanceof SignInToken) {
            const refreshToken = signInRes.refreshToken 
            const accessToken = signInRes.accessToken
            response.cookie('access_token', accessToken, {
                httpOnly: true,
            });
            response.cookie('refresh_token', refreshToken, {
                httpOnly: true,
            })
            response.statusCode = 200
            return new SignInResponseDTO("성공적으로 로그인 되었습니다.")
        }
        return new HttpException("아이디 비밀번호를 확인해주세요", 400)
    }

    @Post('/logout')
    async logOut(
        @Res() response:Response
    ) {
        response.cookie(
            'access_token',
            '',
            {
                maxAge: 0
            }
        )

        response.cookie(
            'refresh_token',
            '',
            {
                maxAge: 0
            }
        )

        return response.send({
            message:"로그아웃 완료",
            STATUS_CODES:200
        })
    }

    @Post('/refresh')
    async refreshToken(
        @Req() request: Request,
        @Res({passthrough: true}) response: Response
    ) {
        const refreshRes:SignInToken|HttpException = await this.userService.refreshToken(request);
        if (!(refreshRes instanceof HttpException)) {
            const accessToken = refreshRes.accessToken
            response.cookie('access_token', accessToken, {
                httpOnly: true
            });
            return JSON.stringify({message:"성공",status: "200"})
        } else {
            return new HttpException("실패", 401)
        }
    }

    @UseGuards(EnterGuard)
    @Get()
    async isUser(
        @Req() request: Request
    ) {
        if (request["valid"] === false) {
            return {
                message: "로그인이 필요합니다.",
                statusCode: 401
            }
        } else {
            return {
                message: "로그인 상태입니다.",
                statusCode: 200
            }
        }
    }
}
