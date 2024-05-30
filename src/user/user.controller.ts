import { Response, Request } from 'express';
import { Body, Controller, Get, HttpException, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SignInDto, SignInResponseDTO, SignInToken, SignUpDto } from './dto/user.dto';
import { EnterGuard } from 'guards/enter.guard';
import { STATUS_CODES } from 'http';

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
            console.log(refreshToken, accessToken)
            response.cookie('access_token', accessToken, {
                httpOnly: true
            });
            response.cookie('refresh_token', refreshToken, {
                httpOnly: true
            })
            response.statusCode = 200
            return new SignInResponseDTO("성공적으로 로그인 되었습니다.")
        }
        return response
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

    @Get('/refresh')
    async refreshToken(
        @Req() request: Request,
        @Res({passthrough: true}) response: Response
    ) {
        const refreshRes:SignInToken|HttpException = await this.userService.refreshToken(request);
        if (refreshRes instanceof SignInDto) {
            const accessToken = refreshRes.accessToken
            response.cookie('access_token', accessToken, {
                httpOnly: true
            });
            return new Response()
        } else {
            return response
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
