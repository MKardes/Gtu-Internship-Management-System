import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("euser")
@Unique(['id', 'mail'])
export class EUser {

   @PrimaryGeneratedColumn("uuid")
   id!: string;

   @Column()
   mail!: string;

   @Column()
   username!: string;

   @Column()
   password!: string;

}