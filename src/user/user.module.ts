import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entity/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { ArticleEntity } from "src/board/entity/Article.entitiy";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, ArticleEntity]),
        JwtModule.register({global: false})
    ],
    controllers: [UserController],
    providers: [UserService]
})

export class UserModule {}