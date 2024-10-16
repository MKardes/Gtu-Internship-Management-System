import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("file")
@Unique(['id', 'name'])
export class File {

   @PrimaryGeneratedColumn()
   id!: number;

   @Column()
   name!: string;

   @Column({ nullable: true })
   drive_link!: number;

}