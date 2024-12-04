import { Column, Entity, PrimaryGeneratedColumn, Unique, CreateDateColumn} from "typeorm";

@Entity("student")
@Unique(['id', 'school_id', 'email', 'turkish_id'])
export class Student {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    school_id: string;

    @Column()
    name: string;

    @Column()
    surname: string;

    @Column()
    email: string;

    @Column({ nullable: true })
    turkish_id: string;

    @CreateDateColumn()
    created_at: Date;

    @Column({ nullable: true }) // şimdilik
    grade: number;
}