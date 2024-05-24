import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class SignUpDto {
    @IsNotEmpty()
    @MaxLength(16)
    @IsString()
    userId: string

    @IsNotEmpty()
    @MaxLength(16)
    @IsString()
    password: string

    @IsNotEmpty()
    @MaxLength(50)
    @IsEmail()
    email: string
}

export class SignUpResponseDto {
    constructor() {
        this.statusCode = '201'
    }
    statusCode: string
}

export class SignInDto {
    @IsNotEmpty()
    @MaxLength(16)
    @IsString()
    userId: string

    @IsNotEmpty()
    @MaxLength(16)
    @IsString()
    password: string
}

export class SignInToken {
    constructor(accessToken:string, refreshToken:string) {
        this.accessToken = accessToken
        this.refreshToken = refreshToken
    }
    accessToken: string
    refreshToken: string
}

export class SignInResponseDTO {
    constructor(message:string) {
        this.data = {}
        this.data.message = message
    }
    data:any
}