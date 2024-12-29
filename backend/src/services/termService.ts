import { validateOrReject } from "class-validator";
import { AppDataSource } from "../../ormconfig";
import { Term } from "../entities/term.entity";
import { format } from "date-fns";
import departmentAdminService from "./departmentAdminService";

const _departmentAdminService = new departmentAdminService();

class termService {
    private termRepository = AppDataSource.getRepository(Term)

    async createTerm(body: any): Promise<{ status: number; data: any[] }> {
        try {
            let term = await this.termRepository.findOneBy({ name: body.name });

            if (!term) {
                term = new Term();
                term.name = body.name;
            }

            term.midterm_fall_begin = body.midterm_fall_begin;
            term.midterm_fall_end = body.midterm_fall_end;
            term.midterm_break_begin = body.midterm_break_begin;
            term.midterm_break_end = body.midterm_break_end;
            term.midterm_spring_begin = body.midterm_spring_begin;
            term.midterm_spring_end = body.midterm_spring_end;
            term.summer_begin = body.summer_begin;
            term.summer_end = body.summer_end;

            await validateOrReject(term);
            
            const result = await this.termRepository.save(term);
            return { status: 200, data: [result] };
        } catch (error) {
            console.error('Error fetching students:', error);
            return { status: 500, data: [] };
        }
    }

    async getTerms(): Promise<{ status: number, data: Term[]}> {
        try {
            const result = await this.termRepository.find();

            return { status: 200, data: result };
        } catch (error) {
            console.error('Error fetching students:', error);
            return { status: 500, data: [] };
        }
    }

    async getTermInternships(userID: string, year: string, companyId: string) {
        if (!userID || !year) {
            return { status: 400, data: { message: 'Kullanıcı veya yıl girilmedi!' } };
        }

        const department = await _departmentAdminService.findUserDepartmentByUserId(userID);

        if (!department) {
            return { status: 404, data: { message: 'Kullanıcının departmanı bulunamadı!' } };
        }

        const pieces = year.split("-");

        if (pieces.length !== 2) {
            return { status: 400, data: { message: 'Bilinmeyen akademik yıl formatı!' } };
        }

        const { status, data } =await this.getTerms();

        if (status !== 200){
            return { status: 404, data: { message: 'Dönem tarihleri getirilemedi!' } };
        }

        const selectedYearTerms = data.find((e: Term) => e.name === year)

        if (!selectedYearTerms) {
            return { status: 404, data: { message: 'Akademik yıl bulunamadı!' } };
        }

        const termDates = Object.entries(selectedYearTerms).map(e => {
            if (e[0] !== "id" &&  e[0] !== "name"){
                return format(e[1], 'yyyy-MM-dd');
            }
        }).filter(e => e);

        const sql = `
            WITH categorized_internships AS (
                SELECT 
                    i.*,
                    s.id as student_id,
                    s.school_id as student_school_id,
                    s.name as student_name,
                    s.surname as student_surname,
                    s.turkish_id as student_turkish_id,
                    s.email as student_email,
                    s.grade as student_grade,
                    CASE 
                        WHEN i.begin_date >= TO_DATE($1, 'YYYY-MM-DD') 
                            AND i.end_date <= TO_DATE($2, 'YYYY-MM-DD') THEN 'midterm_fall'
                        WHEN i.begin_date >= TO_DATE($3, 'YYYY-MM-DD') 
                            AND i.end_date <= TO_DATE($4, 'YYYY-MM-DD') THEN 'midterm_break'
                        WHEN i.begin_date >= TO_DATE($5, 'YYYY-MM-DD') 
                            AND i.end_date <= TO_DATE($6, 'YYYY-MM-DD') THEN 'midterm_spring'
                        WHEN i.begin_date >= TO_DATE($7, 'YYYY-MM-DD') 
                            AND i.end_date <= TO_DATE($8, 'YYYY-MM-DD') THEN 'summer'
                        ELSE 'undefined'
                    END AS period_name
                FROM 
                    internship i
                LEFT JOIN student s
                    ON s.id = i.student_id
                WHERE 
                    i.begin_date >= TO_DATE($1, 'YYYY-MM-DD') 
                    AND i.end_date <= TO_DATE($8, 'YYYY-MM-DD')
                    AND s.department_id = $9
                    ${companyId ? 'AND i.company_id = $10' : ''}
            )
            SELECT 
                ci.*,
                c.name as company_name
            FROM 
                categorized_internships ci
            LEFT JOIN company c on c.id = ci.company_id
            WHERE 
                ci.period_name != 'undefined'
        `.trim();

        const params: any[] = [...termDates, department.id];
        if (companyId) {
            params.push(companyId);
        }

        try {
            const result = await AppDataSource.query(sql, params);
            return { status: 200, data: result };
        } catch (e) {
            console.error(e);
            return { status: 500, data: { message: 'Staj verileri getirilemedi!' } };
        }
    }
    
}

export default termService;
