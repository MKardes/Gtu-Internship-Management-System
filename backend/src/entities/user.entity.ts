import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

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

}