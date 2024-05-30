import { CanActivate, ExecutionContext, HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../src/user/user.service";
import { UserEntity } from "../src/user/entity/user.entity";

@Injectable()
export class EnterGuard implements CanActivate {
    constructor (
        private jwtService:JwtService,
        private userService: UserService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request:any = context.switchToHttp().getRequest();
        return await this.validRequest(request)
    }

    async validRequest(request:any) {
        const accessKey = process.env.SECRET_FOR_ACCESS_TOKEN
        try {
            const cookies:string[] = await request.cookies
            if (Object.keys(cookies).length ===0) {
                throw new HttpException("로그인되지 않았습니다.", 401)
            }
            const accessToken:string = cookies["access_token"]
            
            const userUid:number = this.jwtService.decode(accessToken).userUid
            const isUser:boolean = await this.validUser(userUid, request)
            if (!isUser) {
                throw new HttpException("유효한 접근이 아닙니다.", 401)
            }
            return this.jwtService.verify(accessToken, {secret:accessKey})
        } catch(e) {
            console.log(e.message)
            switch(e.message) {
                case "jwt expired"||"로그인되지 않았습니다."||"Cannot read properties of null (reading 'userUid')":
                    throw new HttpException("로그인이 필요합니다.", 401)
                
                default:
                    throw new HttpException('처리 중에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.', 500);
            }
        }
    }

    // 유효한 사용자인지 검증
    async validUser(userUid:number, request:any) {
        const user:UserEntity|null = await this.userService.getUser(userUid)
        console.log(`user = ${user}`)
        if (user) {
            return true
        } else {
            return false
        }
    }
}