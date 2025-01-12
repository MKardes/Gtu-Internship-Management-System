import { Column, Entity, PrimaryGeneratedColumn, Unique, CreateDateColumn, ManyToOne, JoinColumn} from "typeorm";
import { Department } from "./department.entity";

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

    @ManyToOne(() => Department)
    @JoinColumn({ name: "department_id" })
    department: Department;
}