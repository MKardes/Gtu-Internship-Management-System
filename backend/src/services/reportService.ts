import { report } from "process";
import { AppDataSource } from "../../ormconfig";
import { Internship } from "../entities/internship.entitiy";
import utilService from "./utilService";
import departmentAdminService from "./departmentAdminService";
import { promises as fs } from "fs";
import path from "path";

var officegen = require('officegen')
enum months {
    Ocak = 1,
    Şubat = 2,
    Mart = 3,
    Nisan = 4,
    Mayıs = 5,
    Haziran = 6,
    Temmuz = 7,
    Ağustos = 8,
    Eylül = 9,
    Ekim = 10,
    Kasım = 11,
    Aralık = 12
}

class reportService {
    private internshipRepository = AppDataSource.getRepository(Internship);
    private reportDirectory = "./reports";

    private async getInternships(startingDate: any, endingDate: any) {
        try {
            //zaman ve departmana bakılmalı
            return await this.internshipRepository.find({
                relations: ["student", "company", "mentor"]
            });
        } catch (error) {
            throw new Error("Failed to fetch internships");
        }
    }


    // Create rows for the report
    // -----------------------------------------------------------------------------------
    // | ömer faruk |     olkay     |   microsoft    | begin date | end date |   state   |
    // -----------------------------------------------------------------------------------
    // | ahmet baha |     cepni     |   rockstar     | begin date | end date |   state   |
    // -----------------------------------------------------------------------------------
    private createRows(interns: any) {
        let rows = [];
        let cnt = 1;
        //gün ay yıl
        for (let intern of interns) {
            let row = [];
            row.push(cnt++);
            row.push(intern.student.school_id);
            row.push(intern.student.name + " " + intern.student.surname);
            row.push(intern.company.name);
            row.push(intern.begin_date.toLocaleDateString());
            row.push(intern.end_date.toLocaleDateString());
            if (intern.state === "completed") row.push("S");
            else row.push("U");;
            rows.push(row);
        }
        return rows;
    }
    
        // get api/reports/ ->
    //    - req.user(myRequest) -> user_id
    //    - user_id -> user_department 
    //            - (const user = await getDepartmentAdmin(user_id)) 
    //            -  user.department.department_name
    //    - find reports ->
    //            - file: "./reports/*"" bütün dosyaların isimlerini çek bir arraye yaz;
    //    
    //    - filter reports by reports.department_name ===user.depratment.department_name
    
    async getReport(user: any) {
        try {
            // Kullanıcının departmanını al
            const depService = new departmentAdminService()

            const userDetails: any = await depService.getDepartmentAdmin(user.id);

            if (userDetails.status === 200) {
                const userDepartmentName = userDetails.data?.department?.department_name?.replace(/-/g, '') || '';
                console.log('Kullanıcı departman ismi:', userDepartmentName);
            
                // Tüm rapor dosyalarını oku
                const files = await fs.readdir(this.reportDirectory);
            
                const departmentReports = files.filter(file => {
                    const departmentPart = file.split('_')[0];
                    const departmentName = departmentPart.replace(/-/g, '');
            
                    console.log(`Dosya departmanı: ${departmentName}, Kullanıcı departmanı: ${userDepartmentName}`);
                    return departmentName === userDepartmentName;
                });
            } else {
                console.error('Kullanıcı alınamadı');
            }
            
            // return {
            //     status: 200,
            //     data: { 
            //         message: "Reports fetched successfully",
            //         reports: departmentReports,
            //     }
            // };
        } catch (error) {
            return {
                status: 500,
                data: { 
                    message: `An error occurred while fetching reports: ${error}` 
                }
            };
        }
    }

    async createReport(reportData: any, user: any) {
        try {

            const reportCreator = await utilService.fetchUserById(user.id);
            const reportCreationDateForReport = reportData.day + " " + months[reportData.month] + " " + reportData.year;
            const reportCreationDateForQuery = new Date(parseInt(reportData.year), parseInt(reportData.month) - 1, parseInt(reportData.day));
            const internships = await this.getInternships(reportData.startingDate, reportData.endingDate);
            const rows = this.createRows(internships);
            const comissionVise = reportData.comissionVise;
            const comissionMember1 = reportData.comissionMember1;
            const comissionMember2 = reportData.comissionMember2;

            //Create a new Word document
            const docx = officegen(
                {
                    type: 'docx',
                    pageMargins: { top: 680, right: 680, bottom: 680, left: 680 },
                }
            );

            // Set the title of the document
            docx.setDocTitle('Internship Report1');

            // Create paragraph
            var pObj = docx.createP({ align: 'center' });
            pObj.addText('\n\nGEBZE TEKNİK ÜNİVERSİTESİ MÜHENDİSLİK FAKÜLTESİ\n\nBİLGİSAYAR MÜHENDİSLİĞİ BÖLÜMÜ STAJ KOMİSYONU DEĞERLENDİRME TUTANAĞI\n\n', { bold: false, font_face: 'Times New Roman', font_size: 12, });
            pObj = docx.createP({ align: 'left' });
            pObj.addText('Bölümümüz Staj Komisyonu, ', { bold: false, font_face: 'Times New Roman', font_size: 12 });
            pObj.addText(reportCreationDateForReport, { bold: false, font_face: 'Times New Roman', font_size: 12});
            pObj.addText(' tarihinde toplanmış ve aşağıda öğrenci numarası adı, soyadı belirtilen öğrenci/öğrencilerin zorunlu stajlarının aşağıdaki şekilde değerlendirilmesine karar verilmiştir.\n', { bold: false, font_face: 'Times New Roman', font_size: 12 });
            pObj = docx.createP({ align: 'center', bold: true });
            pObj.addText('ZORUNLU STAJLAR', { bold: true, font_face: 'Times New Roman', font_size: 12, });

            // Create table
            const table = [
                [
                    { val: '#', opts: { b: true, cellColWidth: 650 } },
                    { val: 'Öğrenci No', opts: { b: true, cellColWidth: 1800 } },
                    { val: 'Adı Soyadı', opts: { b: true, cellColWidth: 2500 } },
                    { val: 'Staj Yeri', opts: { b: true, cellColWidth: 2750 } },
                    { val: 'Staj Başlangıç Tarihi', opts: { b: true, cellColWidth: 1300 } },
                    { val: 'Staj Bitiş Tarihi', opts: { b: true, cellColWidth: 1300 } },
                    { val: 'Staj Notu(S/U)', opts: { b: true, cellColWidth: 800 } }
                ],
                ...rows
            ];

            var tableStyle = {
                tableSize: 24,
                tableColor: "ada",
                tableAlign: "left",
                tableFontFamily: "Times New Roman",
                spacingBefor: 120, // default is 100
                spacingAfter: 120, // default is 100
                spacingLine: 240, // default is 240
                spacingLineRule: 'atLeast', // default is atLeast
                indent: 100, // table indent, default is 0
                fixedLayout: true, // default is false
                borders: true, // default is false. if true, default border size is 4
                borderSize: 2, // To use this option, the 'borders' must set as true, default is 4
            }

            docx.createTable(table, tableStyle);

            docx.createP().addLineBreak();
            docx.createP().addLineBreak();
            docx.createP().addLineBreak();

            // Add committee members horizontally
            const committeeTable = [
                [
                    { val: comissionVise, opts: { b: false, cellColWidth: 3450, align: 'left'} },
                    { val: comissionMember1, opts: { b: false, cellColWidth: 3450, align: 'left'} },
                    { val: comissionMember2, opts: { b: false, cellColWidth: 3450, align: 'left'} }
                ],
                [
                    { val: 'Staj Komisyonu Başkanı', opts: { b: false, cellColWidth: 3450, align: 'left' } },
                    { val: 'Staj Komisyonu Üyesi', opts: { b: false, cellColWidth: 3450, align: 'left' } },
                    { val: 'Staj Komisyonu Üyesi', opts: { b: false, cellColWidth: 3450, align: 'left' } }
                ]
            ];

            const committeeTableStyle = {
                tableSize: 5,
                tableAlign: "center", // Center align the table
                tableFontFamily: "Times New Roman",
                spacingBefor: 50, // default is 100
                spacingAfter: 50, // default is 100
                spacingLine: 50, // default is 240
            };

            // Add the table to the document
            docx.createTable(committeeTable, committeeTableStyle);

            // Save the docx file
            const fs = require('fs');
            const filePath = './Internship_Report2131.docx';
            const out = fs.createWriteStream(filePath);

            docx.generate(out);
            out.on('finish', () => {
            });
            return { status: 200, data: { message: 'Report created successfully', filePath } };
        } catch (error) {
            return { status: 500, data: { message: 'A error occured during report creation: ' + error } };
        }
    }
}

export default reportService;
