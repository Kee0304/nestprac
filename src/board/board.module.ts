import { Module } from '@nestjs/common';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { ArticleEntity } from './entity/Article.entitiy';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Module({
  imports:[
    TypeOrmModule.forFeature([ArticleEntity, UserEntity]),
    JwtModule.register({global: false})
  ],
  controllers: [BoardController],
  providers: [BoardService, UserService]
})
export class BoardModule {}
