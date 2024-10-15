import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("company")
@Unique(['id', 'name'])
export class Company {

   @PrimaryGeneratedColumn()
   id: number;

   @Column({ nullable: false })
   name: string;

   @Column({ nullable: false })
   address: string;

   @Column({ nullable: false })
   created_at: Date;

}