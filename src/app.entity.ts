import { CreateDateColumn, DeleteDateColumn, Entity, UpdateDateColumn } from "typeorm";

@Entity()
export class GlobalEntity {

    @CreateDateColumn({type:'timestamp', nullable:false})
    createdAt: Date

    @UpdateDateColumn({type:'timestamp', nullable:true})
    updatedAt: Date

    @DeleteDateColumn({type:'timestamp', nullable:true})
    deletedAt: Date
}