import { Entity, Column, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("verifcode")
@Unique(['id'])
export class VerifCode {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    code: string;

    @Column()
    isActive: boolean;

    @Column()
    mail: string;

    @Column()
    expire_date: Date;
}