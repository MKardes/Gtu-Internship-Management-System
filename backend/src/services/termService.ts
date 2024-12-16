import { validateOrReject } from "class-validator";
import { AppDataSource } from "../../ormconfig";
import { Term } from "../entities/term.entity";

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

    async getTerms(): Promise<{ status: number, data: any[]}> {
        try {
            const result = await this.termRepository.find();

            return { status: 200, data: result };
        } catch (error) {
            console.error('Error fetching students:', error);
            return { status: 500, data: [] };
        }
    }
}

export default termService;
