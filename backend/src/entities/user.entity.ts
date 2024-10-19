import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

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
   username: string;

   @Column()
   password: string;

   @Column()
   role: Role;

}
