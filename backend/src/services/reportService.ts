import { TableColumn } from "typeorm";
import { AppDataSource } from "../../ormconfig";
import { Internship } from "../entities/internship.entitiy";
var officegen = require('officegen')
class reportService {
    private internshipRepository = AppDataSource.getRepository(Internship);

    private async getInternships(startingDate: any, endingDate: any) {
        //zaman ve departmana bakılmalı
        return this.internshipRepository.find({
            relations: ["student", "company", "mentor"]
        });
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

    async createReport(reportData: any) {
        const internships = await this.getInternships(reportData.startingDate, reportData.endingDate);
        const rows = this.createRows(internships);

        // Create a new Word document
        const docx = officegen(
            {
                type: 'docx',
                pageMargins: { top: 680, right: 680, bottom: 680, left: 680 },
            }
        );

        // Header
        docx.setDocTitle('Internship Report1');

        var pObj = docx.createP({ align: 'center'});
        pObj.addText('\n\nGEBZE TEKNİK ÜNİVERSİTESİ MÜHENDİSLİK FAKÜLTESİ\n\nBİLGİSAYAR MÜHENDİSLİĞİ BÖLÜMÜ STAJ KOMİSYONU DEĞERLENDİRME TUTANAĞI.\n\n', { bold: false, font_face: 'Times New Roman', font_size: 12,});

        pObj = docx.createP({ align: 'left' });
        pObj.addText('Bölümümüz Staj Komisyonu, 17 Ekim 2024 tarihinde toplanmış ve aşağıda öğrenci numarası adı, soyadı belirtilen öğrenci/öğrencilerin zorunlu stajlarının aşağıdaki şekilde değerlendirilmesine karar verilmiştir.\n', { bold: false, font_face: 'Times New Roman', font_size: 12,});
        pObj = docx.createP({ align: 'center', bold: true});
        pObj.addText('ZORUNLU STAJLAR\n', { bold: true, font_face: 'Times New Roman',font_size: 12,});

            // Table
            const table = [
                [
                    { val: '#', opts: { b: true, cellColWidth: 650} },
                    { val: 'Öğrenci No', opts: { b: true, cellColWidth: 1800} },
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

        // Save the docx file
        const fs = require('fs');
        const filePath = './Internship_Report2131.docx';
        const out = fs.createWriteStream(filePath);

        docx.generate(out);
        out.on('finish', () => {
            console.log('Report created successfully at ' + filePath);
        });

        return { status: 200, data: { message: 'Report created successfully', filePath } };
    }
}

export default reportService;
