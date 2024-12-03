import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Unique, CreateDateColumn} from "typeorm";
import { Student } from "./student.entitiy";
import { Company } from "./company.entitiy";
import { Mentor } from "./mentor.entitiy";
import { File } from "./file.entitiy";

enum InternshipStates {
    Begin = "begin",
    ReportReceived = "report_received",
    ReportApproved = "report_approved",
    Completed = "completed"
}

@Entity("internship")
@Unique(['id'])
export class Internship {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: string;
    
    @ManyToOne(() => Company)
    @JoinColumn({ name: "company_id" })
    company: Company;

    @ManyToOne(() => Mentor)
    @JoinColumn({ name: "mentor_id" })
    mentor: Mentor;

    @OneToOne(() => File)
    @JoinColumn({ name: "file_id" })
    name: File;

    @ManyToOne(() => Student, { nullable: false })
    @JoinColumn({ name: "student_id" })
    student: Student;

    @Column({nullable: false, default: InternshipStates.Begin})
    state: InternshipStates
    
    @Column({nullable: false, default: false})
    is_sgk_uploaded: boolean

    @Column({ nullable: true })
    begin_date: Date;

    @Column({ nullable: true })
    end_date: Date;

    @CreateDateColumn()
    created_at: Date;
}