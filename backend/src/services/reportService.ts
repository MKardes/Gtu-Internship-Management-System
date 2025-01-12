import { AppDataSource } from "../../ormconfig";
import { Internship } from "../entities/internship.entity";
import utilService from "./utilService";
import termService from "./termService";
import departmentAdminService from "./departmentAdminService";
import { readdir, readFile, unlink } from "fs/promises";
import { Writable } from "stream";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, AlignmentType, WidthType, HeadingLevel, HeightRule } from "docx";
import { writeFile } from "fs/promises";

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
    private _departmentAdminService = new departmentAdminService()

    // get api/reports/ ->
    //    - req.user(myRequest) -> user_id
    //    - user_id -> user_department 
    //            - (const user = await getDepartmentAdmin(user_id)) 
    //            -  user.department.department_name
    //    - find reports ->
    //            - file: "./reports/*"" bütün dosyaların isimlerini çek bir arraye yaz;
    //    
    //    - filter reports by reports.department_name ===user.depratment.department_name

    async getReports(user: any): Promise<{ status: number; data: any }> {

        try {
            // Kullanıcının detaylarının alınması
            const userDetails: any = await this._departmentAdminService.getDepartmentAdmin(user.id);

            if (userDetails.status === 200) {
                const userDepartmentName = userDetails.data?.department?.department_name || '';

                // Tüm rapor dosyalarını oku
                const files = await readdir(this.reportDirectory);

                const filteredReports = files
                    .map((file: any) => {
                        const parts = file.split("_");
                        const department = parts[0].replace("-", " ");
                        const academicYear = parts[1];
                        const term = parts[2].replace("-", "_");
                        const date = parts[3].replace(".docx", "");
                        return { file, department, academicYear, term, date };
                    })
                    .filter((e: any) => e.department.toLowerCase() === userDepartmentName.toLowerCase())
                    .map((e) => ({
                        file: e.file,
                        academicYear: e.academicYear,
                        term: e.term,
                        date: e.date,
                    }))
                    .sort((a: any, b: any) => {
                        const dateA = new Date(a.date.split('-').reverse().join('-'));
                        const dateB = new Date(b.date.split('-').reverse().join('-'));
                        return dateB.getTime() - dateA.getTime();
                    });

                return { status: 200, data: filteredReports };
            } else {
                throw new Error('Kullanıcı alınamadı')
            }

        } catch (error) {
            return {
                status: 500,
                data: {
                    message: `An error occurred while fetching reports: ${error}`
                }
            };
        }
    }

    async deleteReport(filePath: any) {
        try {
            if (!filePath) {
                throw new Error("File query param is required!");
            }

            try {
                await unlink(this.reportDirectory + "/" + filePath);
            } catch (e) {
                throw new Error('Error deleting file:' + e);
            }

            return { status: 200, data: { message: 'Report deleted successfully ' + filePath } };
        } catch (error) {

            return { status: 404, data: { message: 'A error occured during report deletion: ' + error } };
        }
    }

    private async getInternships(user: any, term: any, year: any) {
        try {
            const termserv = new termService();
            const response = (await termserv.getTermInternships(user.id, year, ""));
            if (response.status != 200)
                return { status: response.status, data: { message: response.data.message } };
            const internships = response.data;
            const filteredInternships = internships.filter((internship: any) => internship.period_name == term);
            return { status: 200, data: filteredInternships };
        } catch (error) {
            return { status: 500, data: { message: 'An error occured while fetching internships: ' + error } };
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
            row.push(intern.student_school_id);
            row.push(intern.student_name + " " + intern.student_surname);
            row.push(intern.company_name);
            row.push(intern.begin_date.toLocaleDateString());
            row.push(intern.end_date.toLocaleDateString());
            if (intern.state === "completed") row.push("S");
            else row.push("U");;
            rows.push(row);
        }
        return rows;
    }


    async createReport(reportData: any, user: any) {
        let semester = "";
        switch (reportData.semester) {
            case "Dönem içi 'Bahar'":
                semester = "midterm_spring";
                break;
            case "Dönem içi 'Güz'":
                semester = "midterm_fall";
                break;
            case "Ara Dönem":
                semester = "midterm_break";
                break;
            case "Yaz Dönemi":
                semester = "summer";
                break;
        }

        try {
            if (!reportData.day || !reportData.month || !reportData.year || !reportData.term || !reportData.comissionVise || !reportData.comissionMember1 || !reportData.comissionMember2)
                return { status: 400, data: { message: 'Tüm alanlar doldurulmalıdır.' } };
            // All commionMembers must be different
            if (reportData.comissionVise === reportData.comissionMember1 || reportData.comissionVise === reportData.comissionMember2 || reportData.comissionMember1 === reportData.comissionMember2)
                return { status: 400, data: { message: 'Komisyon üyeleri birbirinden farklı olmalıdır.' } };
            const reportCreator = await utilService.fetchUserById(user.id);
            const reportCreationDateForReport = `${reportData.day} ${months[reportData.month]} ${reportData.year}`;
            const internshipsResponse = await this.getInternships(reportCreator, semester, reportData.term);
            if (internshipsResponse.status !== 200) {
                return { status: internshipsResponse.status, data: { message: internshipsResponse.data.message } };
            }

            const rows = this.createRows(internshipsResponse.data);

            const doc = new Document({
                sections: [
                    {
                        properties: {
                            page: {
                                margin: {
                                    top: 900,  // 2.54 cm in Twips (1/20 of a point)
                                    right: 720,
                                    bottom: 900,
                                    left: 720,
                                },

                            },

                        },
                        children: [
                            new Paragraph({ // Boş satır
                                text: "",
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "GEBZE TEKNİK ÜNİVERSİTESİ MÜHENDİSLİK FAKÜLTESİ",
                                        size: 24, // 12pt
                                        font: "Times New Roman",
                                    }),
                                ],
                                alignment: AlignmentType.CENTER,
                            }),
                            new Paragraph({ // Boş satır
                                text: "",
                            }),
                            new Paragraph({ // Boş satır
                                text: "",
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "BİLGİSAYAR MÜHENDİSLİĞİ BÖLÜMÜ STAJ KOMİSYONU DEĞERLENDİRME TUTANAĞI",
                                        size: 24, // 12pt
                                        font: "Times New Roman",
                                    }),
                                ],
                                alignment: AlignmentType.CENTER,
                            }),
                            new Paragraph({ // Boş satır
                                text: "",
                            }),
                            new Paragraph({ // Boş satır
                                text: "",
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `Bölümümüz Staj Komisyonu, ${reportCreationDateForReport} tarihinde toplanmış ve aşağıda öğrenci numarası, adı, soyadı belirtilen öğrenci/öğrencilerin zorunlu stajlarının aşağıdaki şekilde değerlendirilmesine karar verilmiştir.`,
                                        size: 24, // 10pt
                                        font: "Times New Roman",
                                    }),
                                ],
                            }),
                            new Paragraph({ // Boş satır
                                text: "",
                            }),
                            new Paragraph({ // Boş satır
                                text: "",
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "ZORUNLU STAJLAR",
                                        size: 24, // 12pt
                                        font: "Times New Roman",
                                        bold: true,
                                    }),
                                ],
                                alignment: AlignmentType.CENTER,
                            }),
                            new Paragraph({ // Boş satır
                                text: "",
                            }),
                            new Table({
                                rows: [
                                    new TableRow({
                                        children: [
                                            "#", "Öğrenci No", "Adı Soyadı", "Staj Yeri", "Staj Başlangıç Tarihi", "Staj Bitiş Tarihi", "Staj Notu(S/U)"
                                        ].map((text) =>
                                            new TableCell({
                                                children: [new Paragraph({
                                                    children: [new TextRun({
                                                        text,
                                                        bold: true,
                                                        font: "Times New Roman",
                                                        size: 24
                                                    })]
                                                })],
                                                width: { size: 15, type: WidthType.PERCENTAGE },
                                                borders: { top: { style: "none" }, bottom: { style: "none" }, left: { style: "none" }, right: { style: "none" } },
                                            })
                                        ),
                                        height: { value: 700, rule: HeightRule.EXACT } // Satır yüksekliğini burada ayarlıyoruz
                                    }),
                                    ...rows.map((row) => new TableRow({
                                        children: row.map((text) =>
                                            new TableCell({
                                                children:
                                                    [
                                                        new Paragraph({
                                                            children: [new TextRun({
                                                                text: text.toString(),
                                                                font: "Times New Roman",
                                                                size: 22
                                                            })]
                                                        }),
                                                        new Paragraph({ text: "" }),

                                                    ],
                                                borders: { top: { style: "none" }, bottom: { style: "none" }, left: { style: "none" }, right: { style: "none" } },
                                            })
                                        ),
                                        height: {
                                            rule: HeightRule.AUTO,
                                            value: 0
                                        } // Her bir satır için yüksekliği ayarlıyoruz
                                    })),
                                ],
                            }),

                            new Paragraph({ // Boş satır
                                text: "",
                            }),
                            new Paragraph({ // Boş satır
                                text: "",
                            }),
                            new Paragraph({ // Boş satır
                                text: "",
                            }),
                            new Paragraph({ // Boş satır
                                text: "",
                            }),
                            new Paragraph({ // Boş satır
                                text: "",
                            }),
                            new Paragraph({ // Boş satır
                                text: "",
                            }),
                            new Paragraph({ // Boş satır
                                text: "",
                            }),
                            new Table({
                                width: { size: 100, type: WidthType.PERCENTAGE },  // Tabloyu sayfa genişliğine orantılı hale getirmek
                                rows: [
                                    new TableRow({
                                        children: [
                                            new TableCell({
                                                children: [new Paragraph({
                                                    children: [new TextRun({ text: reportData.comissionVise, font: "Times New Roman", size: 24 })]
                                                })],
                                                borders: { top: { style: "none" }, bottom: { style: "none" }, left: { style: "none" }, right: { style: "none" } }
                                            }),
                                            new TableCell({
                                                children: [new Paragraph({
                                                    children: [new TextRun({ text: reportData.comissionMember1, font: "Times New Roman", size: 24 })]
                                                })],
                                                borders: { top: { style: "none" }, bottom: { style: "none" }, left: { style: "none" }, right: { style: "none" } }
                                            }),
                                            new TableCell({
                                                children: [new Paragraph({
                                                    children: [new TextRun({ text: reportData.comissionMember2, font: "Times New Roman", size: 24 })]
                                                })],
                                                borders: { top: { style: "none" }, bottom: { style: "none" }, left: { style: "none" }, right: { style: "none" } }
                                            }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({
                                                children: [new Paragraph({
                                                    children: [new TextRun({ text: "Staj Komisyonu Başkanı", font: "Times New Roman", size: 24 })]
                                                })],
                                                borders: { top: { style: "none" }, bottom: { style: "none" }, left: { style: "none" }, right: { style: "none" } }
                                            }),
                                            new TableCell({
                                                children: [new Paragraph({
                                                    children: [new TextRun({ text: "Staj Komisyonu Üyesi", font: "Times New Roman", size: 24 })]
                                                })],
                                                borders: { top: { style: "none" }, bottom: { style: "none" }, left: { style: "none" }, right: { style: "none" } }
                                            }),
                                            new TableCell({
                                                children: [new Paragraph({
                                                    children: [new TextRun({ text: "Staj Komisyonu Üyesi", font: "Times New Roman", size: 24 })]
                                                })],
                                                borders: { top: { style: "none" }, bottom: { style: "none" }, left: { style: "none" }, right: { style: "none" } }
                                            }),
                                        ],
                                    }),
                                ],
                                columnWidths: [25, 35, 40],  // Her hücrenin genişliğini orantılı şekilde ayarlamak
                                borders: {
                                    top: { style: "none" },
                                    bottom: { style: "none" },
                                    left: { style: "none" },
                                    right: { style: "none" },
                                    insideHorizontal: { style: "none" },
                                    insideVertical: { style: "none" },
                                },  // Tablonun sınırlarını kaldırmak
                                alignment: AlignmentType.CENTER,  // Tabloyu sayfa ortasına yerleştirmek
                            })

                        ],
                    },
                ],
            });

            const department = reportCreator.department.department_name.replace(" ", "-");
            const meetingdate = `${String(reportData.day).padStart(2, "0")}-${String(reportData.month).padStart(2, "0")}-${reportData.year}`;
            const academicYear = reportData.term;
            const sem = semester.replace("_", "-");
            const fileName = `${department}_${academicYear}_${sem}_${meetingdate}.docx`;
            const filePath = this.reportDirectory + "/" + fileName;

            const buffer = await Packer.toBuffer(doc);
            await writeFile(filePath, buffer);

            const headers = {
                "Content-Disposition": `attachment; filename=${encodeURIComponent(fileName)}`,
                "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            };

            return { status: 200, data: buffer, headers };
        } catch (error) {
            return { status: 500, data: { message: "An error occurred during report creation: " + error } };
        }
    }

    async getReport(fileName: string) {
        try {
            const filePath = this.reportDirectory + "/" + fileName;
            const buffer = await readFile(filePath);

            const headers = {
                'Content-Disposition': `attachment; filename=${fileName}`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            }

            return { status: 200, data: buffer, headers: headers };
        } catch (error) {
            return { status: 500, data: { message: 'A error occured during report creation: ' + error } };
        }
    }
}

export default reportService;