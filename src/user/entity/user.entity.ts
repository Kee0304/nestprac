import { GlobalEntity } from "src/app.entity";
import { ArticleEntity } from "src/board/entity/Article.entitiy";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity extends GlobalEntity {
    @PrimaryGeneratedColumn()
    userUid: number;

    @Column()
    userId: string;

    @Column()
    password: string;

    @Column()
    email: string;

    @Column({type: 'text', nullable: true})
    refreshToken: string;

    @OneToMany(() => ArticleEntity, (article) => article.user)
    articles: ArticleEntity[];

}