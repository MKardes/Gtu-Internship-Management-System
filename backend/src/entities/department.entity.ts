import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("department")
@Unique(['id', 'department_name'])
export class Department {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    department_name: string;
}   