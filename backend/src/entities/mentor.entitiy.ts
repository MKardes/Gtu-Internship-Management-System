import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("mentor")
@Unique(['id', 'mail'])
export class Mentor {

   @PrimaryGeneratedColumn()
   id: number;

   @Column({ nullable: true })
   mail: string;

   @Column({ nullable: true })
   name: string;

   @Column({ nullable: true })
   surname: string;

   @Column({ nullable: true })
   phone_number: string;

}