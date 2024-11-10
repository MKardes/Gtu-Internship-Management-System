import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Department } from "./department.entity";

export enum Role {
    SuperAdmin = "Super Admin",
    DepartmentAdmin = "Department Admin",
    User = "User",
}

@Entity("user")
@Unique(['id', 'mail'])
export class User {

   @PrimaryGeneratedColumn("uuid")
   id: string;

   @Column()
   mail: string;

   @Column()
   full_name: string;

   @Column()
   password: string;

   @Column()
   role: Role;

   @Column({nullable: true})
   refreshToken: string;
   
   @ManyToOne(() => Department)
   @JoinColumn({ name: "department_id" })
   department: Department;

}