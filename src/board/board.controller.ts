import { Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { BoardService } from './board.service';
import { ArticlePostResponseDTO, ArticleUpdateDTO } from './dto/article.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/app.guard';

@Controller('board')
export class BoardController {
    constructor(
        private readonly boardService:BoardService
    ) {}

    @Get()
    async getArticles() {
        return await this.boardService.getArticles()
    }
    
    @Get(':postUid')
    async getArticleDetail(
        @Param('postUid') postUid: string
    ) {
        return await this.boardService.getArticleDetail(parseInt(postUid))
    }

    @UseGuards(AuthGuard)
    @Post()
    async postArticle(
        @Req() request: Request
    ) {
        const result = await this.boardService.postArticle(request.body);
        const response = new ArticlePostResponseDTO(result.postUid);
        return response
    }

    @UseGuards(AuthGuard)
    @Put(':postUid')
    async updateArticle(
        @Req() request: Request,
        @Param('postUid') postUid: string
    ) {
        const articleUpdateDTO:ArticleUpdateDTO = new ArticleUpdateDTO(
            request.body.title,
            request.body.description
        )
        const result = await this.boardService.updateArticle(articleUpdateDTO, postUid)
        return new ArticlePostResponseDTO(parseInt(postUid))
    }

    @UseGuards(AuthGuard)
    @Delete(':postUid')
    async deleteArticle(
        @Param('postUid') postUid: string
    ) {
        return await this.boardService.deleteArticle(postUid)
    }
}
