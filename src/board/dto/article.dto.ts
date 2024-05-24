import { IsNotEmpty, IsString, MaxLength } from "class-validator"
import { UserEntity } from "src/user/entity/user.entity"

export class ArticlePostDto {
    @IsNotEmpty()
    @MaxLength(200)
    @IsString()
    title: string

    @IsNotEmpty()
    @IsString()
    description: string

    @IsNotEmpty()
    userUid: number
}

export class ArticlePostResponseDTO {
    constructor(postUid:number) {
        this.postUid = postUid
    }

    postUid:number
}


export class ArticleGetResponseDTO {
    constructor(postUid:number, title:string, description:string, user:UserEntity) {
        this.postUid = postUid
        this.title = title
        this.description = description
        this.userUid = user.userUid,
        this.userId = user.userId
    }
    postUid:number
    title:string
    description:string
    userUid:number
    userId:string
}

export class ArticleUpdateDTO {
    constructor(title:string, description:string) {
        this.title = title
        this.description = description
    }
    title:string
    description:string
}

export class ArticleUpdateResponseDto {
    constructor(postUid:number) {
        this.postUid = postUid
    }

    postUid:number
}