import { Exclude } from "class-transformer";
import { GlobalEntity } from "src/app.entity";
import { UserEntity } from "src/user/entity/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ArticleEntity extends GlobalEntity {
    @PrimaryGeneratedColumn()
    postUid: number;
    
    @Column({type:'varchar', length:200})
    title: string;
    
    @Column({type:'text'})
    description: string;
    
    @ManyToOne(() => UserEntity, (user) => user.articles)
    user: UserEntity;
}