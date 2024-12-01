import { AppDataSource } from "../../ormconfig";
import { InternShipChartDto } from "../dto/InternshipChart.dto";
import { Company } from "../entities/company.entitiy";
import { Internship } from "../entities/internship.entitiy";
import { getYear, getMonth } from "date-fns"

class chartService {
    private internshipRepository = AppDataSource.getRepository(Internship);
    private companyRepository = AppDataSource.getRepository(Company);

    private toInternshipChartDto(entitiy: any): InternShipChartDto {
        const dto = new InternShipChartDto();
        dto.midterm_fall = { passed: 0, failed: 0 }
        dto.midterm_break = { passed: 0, failed: 0 }
        dto.midterm_spring = { passed: 0, failed: 0 }
        dto.summer = { passed: 0, failed: 0 }

        entitiy.forEach((element: any) => {
            if (element.period_name){
                dto[element.period_name as keyof InternShipChartDto].passed = Number(element.completed);
                dto[element.period_name as keyof InternShipChartDto].failed = Number(element.failed);
            }
        });

        return dto;
    }

    async getInternships(year: string, companyId: string) {
        const pieces = year.split("-");
        if (pieces.length !== 2) {
            return { status: 400, data: { message: 'Bilinmeyen yıl formatı!' } };
        }
    
        const [startYear, endYear] = pieces;
        
        const sql = `
            WITH categorized_internships AS (
                SELECT 
                    i.begin_date as begin,
                    i.state,
                    CASE 
                        WHEN i.begin_date >= TO_DATE($1 || '-09-01', 'YYYY-MM-DD') 
                         AND i.end_date <= TO_DATE($2 || '-01-12', 'YYYY-MM-DD') THEN 'midterm_fall'
                        WHEN i.begin_date >= TO_DATE($2 || '-01-13', 'YYYY-MM-DD') 
                         AND i.end_date <= TO_DATE($2 || '-02-28', 'YYYY-MM-DD') THEN 'midterm_break'
                        WHEN i.begin_date >= TO_DATE($2 || '-02-28', 'YYYY-MM-DD') 
                         AND i.end_date <= TO_DATE($2 || '-06-25', 'YYYY-MM-DD') THEN 'midterm_spring'
                        WHEN i.begin_date >= TO_DATE($2 || '-06-26', 'YYYY-MM-DD') 
                         AND i.end_date <= TO_DATE($2 || '-08-31', 'YYYY-MM-DD') THEN 'summer'
                        ELSE 'undefined'
                    END AS period_name
                FROM 
                    internship i 
                WHERE 
                    i.begin_date >= TO_DATE($1 || '-09-01', 'YYYY-MM-DD') 
                    AND i.end_date <= TO_DATE($2 || '-08-31', 'YYYY-MM-DD')
                    ${companyId ? 'AND i.company_id = $3' : ''}
            )
            SELECT 
                ci.period_name,
                COUNT(CASE WHEN ci.state = 'completed' THEN 1 END) AS completed,
                COUNT(CASE WHEN ci.state = 'failed' THEN 1 END) AS failed,
                COUNT(*) AS cnt
            FROM 
                categorized_internships ci
            WHERE 
                ci.period_name != 'undefined'
                AND (
                    ci.state = 'completed'
                    OR ci.state = 'failed'
                )
            GROUP BY 
                ci.period_name;
        `.trim();
    
        const params: any[] = [startYear, endYear];
        if (companyId) {
            params.push(companyId);
        }
    
        try {
            const result = await AppDataSource.query(sql, params);
            return { status: 200, data: this.toInternshipChartDto(result) };
        } catch (e) {
            console.error(e);
            return { status: 500, data: { message: 'Staj verileri getirilemedi!' } };
        }
    }    

    async getYears() {
        try {
            const firstInternship = await this.internshipRepository
                                            .createQueryBuilder('int')
                                            .orderBy('int.begin_date', "ASC")
                                            .getOne();

            const beginYear = getMonth(firstInternship.begin_date) >= 8 ? getYear(firstInternship.begin_date) : getYear(firstInternship.begin_date) - 1;
            const endYear = getMonth(new Date()) >= 8 ? getYear(new Date()) : getYear(new Date()) - 1;

            const years: {
            name: string
            value: number
            }[] = [];

            for (let i = endYear, val = 1; i >= beginYear; i--, val++){
                years.push({
                    name: "" + i + "-" + (i + 1),
                    value: val
                });
            }

            return { status: 200, data: years };
        } catch (e) {
            return { status: 500, data: { message: 'Yıl bilgisi alınamadı' } };
        }
    }
    
    async getCompanies(){
        try {
            const companies = await this.companyRepository
                                            .createQueryBuilder('c')
                                            .orderBy('c.name', "ASC")
                                            .getMany();

            return { status: 200, data: companies.map((e: Company, index: number) => ({
                name: e.name,
                value: index + 1,
                id: e.id,
            })) };
        } catch (e) {
            return { status: 500, data: { message: 'Şirket bilgileri alınamadı' } };
        }
    }
}
export default chartService;
