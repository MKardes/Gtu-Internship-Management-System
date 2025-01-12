import { format } from "path";
import { AppDataSource } from "../../ormconfig";
import { Internship } from "../entities/internship.entity";
import { Term } from "../entities/term.entity";
import { Student } from "../entities/student.entity";
import { Company } from "../entities/company.entity";
import { Mentor } from "../entities/mentor.entity";
import { File } from "../entities/file.entity";
import nodemailer from "nodemailer";
import { formatDate } from "date-fns";
import { debug } from "console";
import departmentAdminService from "./departmentAdminService";

class DashboardService {
  private _departmentAdminService = new departmentAdminService();

  FormatTurk = (date: Date): string => {
    const months = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];
  
    const day = date.getDate(); // Gün
    const month = months[date.getMonth()]; // Ay (Türkçe)
    const year = date.getFullYear(); // Yıl
  
    return `${day} ${month} ${year}`;
  };

  async getStudents(userID: any, grade?: any, semester?: any): Promise<{ status: number; data: any[] }> {
    try {
      if (!userID) throw new Error("Kullanıcı bulunamadı!");

      const userDepartment = await this._departmentAdminService.findUserDepartmentByUserId(userID);
      if (!userDepartment) throw new Error('Kullanıcının departmanı bulunamadı!');

      const queryBuilder = AppDataSource.getRepository(Internship)
        .createQueryBuilder('internship')
        .leftJoinAndSelect('internship.student', 'student', 'student.id = internship.student_id')
        .leftJoinAndSelect('internship.mentor', 'mentor', 'mentor.id = internship.mentor_id')
        .leftJoinAndSelect('internship.company', 'company', 'company.id = internship.company_id')
        .leftJoinAndSelect('internship.name', 'file', 'file.id = internship.file_id')
        
        .andWhere('student.department_id = :usrDepartment', {usrDepartment: userDepartment.id});

      if (grade) {
        queryBuilder.andWhere('internship.grade = :grade', { grade: parseInt(grade, 10) });
      }

      const termBuilder = AppDataSource.getRepository(Term);
      const result = await termBuilder.find();
      

      if (semester) {
        const selectedYearTerms = result.find((e: Term) => e.name === semester)
        const termDates = Object.entries(selectedYearTerms).map(e => {
            if (e[0] !== "id" &&  e[0] !== "name"){
                return formatDate(e[1], 'yyyy-MM-dd');
            }
        }).filter(e => e);

        debug(termDates)

        queryBuilder.andWhere('internship.begin_date >= :beginDate', { beginDate: termDates[0] });
        queryBuilder.andWhere('internship.end_date <= :endDate', { endDate: termDates[7] });
      }

      queryBuilder.orderBy('internship.created_at', 'DESC');

      // Fetch both student and internship columns
      const students = await queryBuilder.select([
        'student.school_id',
        'student.name',
        'student.surname',
        'student.email',
        'student.turkish_id',
        'internship.id',
        'internship.type',
        'internship.mentor',
        'internship.name',
        'internship.state',
        'internship.is_sgk_uploaded',
        'internship.begin_date',
        'internship.end_date',
        'internship.created_at',
        'company.name',
        'company.address',
        'mentor.name',
        'mentor.surname',
        'mentor.mail',
        'mentor.phone_number',
        'file.name',
        'file.drive_link',
      ]).getMany();

      const newstudents = students.map((e: any) => {
        return {
          ...e,
          begin_date: this.FormatTurk(e.begin_date),
          end_date: this.FormatTurk(e.end_date),
          created_at: this.FormatTurk(e.created_at),
        }
      }
      )

      return { status: 200, data: newstudents };
    } catch (error) {
      console.error('Error fetching students:', error);
      return { status: 500, data: [] };
    }
  }

  async putInternshipState(internshipId: number, state: string, isSgkUploaded: any): Promise<{ status: number; data: any[] }> {
    let payload = {}

    if (state) {
      payload = {
        state: state
      }
    }

    if (isSgkUploaded !== undefined) {
      payload = {
        ...payload,
        is_sgk_uploaded: isSgkUploaded
      }
    }

    try {
      await AppDataSource.createQueryBuilder()
        .update(Internship)
        .set(payload)
        .where("id = :paramIntId", { paramIntId: internshipId })
        .execute()
      return { status: 200, data: [] };
    } catch (error) {
      console.error('Error fetching students:', error);
      return { status: 500, data: [] };
    }
  }

  async sendMail(email: string, subject: string, message: string){
    try {
      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: message,
      });

      return { status: 200, data: { message: 'Internship mail sent successfully!' } };
    } catch (error) {
      console.error(error);
      return { status: 500, data: { message: 'An error occurred while sending mail', error: error } };
    }
  }
}

export default DashboardService;
