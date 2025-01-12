import { format } from "path";
import { AppDataSource } from "../../ormconfig";
import { Internship } from "../entities/internship.entity";
import { Term } from "../entities/term.entity";
import nodemailer from "nodemailer";
import { formatDate } from "date-fns";
import { debug } from "console";

class DashboardService {

  async getStudents(grade?: any, semester?: any): Promise<{ status: number; data: any[] }> {
    try {
      const queryBuilder = AppDataSource.getRepository(Internship)
        .createQueryBuilder('internship')
        .leftJoinAndSelect('internship.student', 'student', 'student.id = internship.student_id')
        .leftJoinAndSelect('internship.mentor', 'mentor', 'mentor.id = internship.mentor_id')
        .leftJoinAndSelect('internship.company', 'company', 'company.id = internship.company_id');


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

      queryBuilder.orderBy('student.name', 'ASC');

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
      ]).getMany();

      return { status: 200, data: students };
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
