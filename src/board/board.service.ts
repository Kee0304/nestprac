import { Injectable, NotAcceptableException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArticleEntity } from './entity/Article.entitiy';
import { DeleteResult, IsNull, Not, Repository, UpdateResult } from 'typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { ArticlePostDto, ArticleGetResponseDTO, ArticleUpdateDTO } from './dto/article.dto';

@Injectable()
export class BoardService {
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly boardRepo: Repository<ArticleEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>
    ) {}

    async getArticles() {
        const articles = await this.boardRepo.find({
            where: {
                deletedAt: IsNull()
            },
            relations: ["user"]
        });
        console.log(articles)
        const response:ArticleGetResponseDTO[] = articles.map(
            (article) => {
                return new ArticleGetResponseDTO(
                    article.postUid, article.title, article.description, article.user
                )
            }
        )
        return response
    }

    async getArticleDetail(postUid: number, options?:any) {
        if (options) {
            return await this.boardRepo.findOne({
                where: {
                    postUid: postUid
                },
                relations:["user"]
            })
        } else {
            return await this.boardRepo.findOne({
                where: {
                    postUid: postUid
                }
            })
        }

    }

    async postArticle(data: ArticlePostDto) {
        console.log(data)
        const user = await this.userRepo.findOne(
            {
                where: {
                    userUid: data.userUid
                }
            }
        )

        return await this.boardRepo.save({
            title: data.title,
            description: data.description,
            user: user
        })
    }

    async updateArticle(data: ArticleUpdateDTO, postUid:string) {
        const result:UpdateResult = await this.boardRepo.update(
            {postUid:parseInt(postUid)},
            {...data}
        )
        return result.affected
    }

    async deleteArticle(postUid:string) {
        const result:UpdateResult = await this.boardRepo.softDelete({
            postUid: parseInt(postUid)
        })
        return result.affected
    }
}
