/**
 * 
 * import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

    @Entity()
    export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: true })
    isActive: boolean;
    }

 */