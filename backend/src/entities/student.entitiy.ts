import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("student")
@Unique(['id', 'school_id'])
export class Student {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    school_id!: string;

    @Column()
    name!: string;

    @Column()
    surname!: string;

    @Column({ nullable: true })
    turkish_id!: string;

    @Column()
    created_at!: Date;
       
}