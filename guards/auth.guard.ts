    import { CanActivate, ExecutionContext, HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
    import { JwtService } from "@nestjs/jwt";
    import { UserService } from "../src/user/user.service";
    import { UserEntity } from "../src/user/entity/user.entity";
    import { BoardService } from "../src/board/board.service";

    @Injectable()
    export class AuthGuard implements CanActivate {
        constructor (
            private jwtService:JwtService,
            private userService: UserService,
            private boardService: BoardService
        ) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const request:any = context.switchToHttp().getRequest();
            return await this.validRequest(request)
        }

        async validRequest(request:any) {
            const accessKey = process.env.SECRET_FOR_ACCESS_TOKEN
            try {
                const cookies:string[] = request.cookies
                const accessToken:string = cookies["access_token"]
                const userUid:number = this.jwtService.decode(accessToken).userUid
                const isUser:boolean = await this.validUser(userUid, request)
                if (!isUser) {
                    throw new HttpException("유효한 접근이 아닙니다.", 401)
                } else {
                    if (request.method === "POST" || request.method === "PUT" || request.method ==="DELETE") {
                        request.body.userUid = userUid;
                    }
                }
                
                if (request.method === "PUT" || request.method ==="DELETE") {
                    const url:string[] = request.originalUrl.split("/")
                    if (url[1] === 'board') {
                        const auth:boolean|null = await this.isAuthor(userUid, parseInt(url[2]))

                        if (auth === null) {
                            throw new HttpException("리소스를 찾지 못했습니다.", 404)
                        } else if (auth === false) {
                            throw new HttpException("권한이 존재하지 않습니다.", 401)
                        }
                    }
                }
                return this.jwtService.verify(accessToken, {secret:accessKey})
            } catch(e) {
                switch(e.message) {
                    case "Cannot read properties of null (reading 'userUid')" || "유효한 접근이 아닙니다." :
                        throw new HttpException("유효한 접근이 아닙니다.", 401)

                    case "jwt expired":
                        throw new HttpException("토큰이 만료되었습니다.", 441)

                    case "권한이 존재하지 않습니다.":
                        throw new HttpException("권한이 존재하지 않습니다.", 401)
                    
                    case "리소스를 찾지 못했습니다.":
                        throw new HttpException("리소스를 찾지 못했습니다.", 404)
                    
                    default:
                        throw new HttpException('처리 중에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.', 500);
                }
            }
        }

        // 유효한 사용자인지 검증
        async validUser(userUid:number, request:any) {
            const user:UserEntity|null = await this.userService.getUser(userUid)
            if (user) {
                return true
            } else {
                return false
            }
        }

        // 어떤 데이터의 author가 요청한 user인지 여부 검증
        async isAuthor(userUid:number, postUid:number) {
            const article = await this.boardService.getArticleDetail(postUid, 1)
            if (article === null) {
                return null
            }
            const authorUid = article.user.userUid
            if (userUid === authorUid) {
                return true
            } else {
                return false
            }
        }
    }