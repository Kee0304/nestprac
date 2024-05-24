import { Response, Request } from 'express';
import { Body, Controller, Get, HttpException, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { SignInDto, SignInResponseDTO, SignInToken, SignUpDto } from './dto/user.dto';

@Controller('/user')
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
}
