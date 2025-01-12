import { AppDataSource } from '../../ormconfig'
import { Department } from "../../src/entities/department.entity";
import { Student } from "../../src/entities/student.entity";
import { Company } from "../../src/entities/company.entity";
import { Mentor } from "../../src/entities/mentor.entity";
import { Internship } from "../../src/entities/internship.entity";
import { File } from "../../src/entities/file.entity";
import { google } from 'googleapis';
import pdf from 'pdf-parse';



const apikey = require('./apikey.json');
const private_key = apikey.private_key;
const client_email = apikey.client_email;
const jwtClient = new google.auth.JWT(
    client_email,
    null,
    private_key,
    ['https://www.googleapis.com/auth/drive']
);



/*
    this function is used to convert a stream to a buffer
*/
async function streamToBuffer(stream: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        stream.on('data', (chunk: any) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

/*
    this function is used to:
    1- get all pdf files from the drive
    2- read the content of each pdf file
    3- extract the student, company, mentor and internship information from the pdf content
    4- add the extracted information to the database
*/
async function parsePdf() {
    
    try {
        
        // authorize the jwtClient and get the drive object
        await jwtClient.authorize();
        const drive = google.drive({ version: 'v3', auth: jwtClient });

        // get all pdf files from the drive
        const res = await drive.files.list({
            fields: 'files(id, name, webViewLink, webContentLink)',
            q: "mimeType='application/pdf'",
        });

        // read the content of each pdf file and extract the student, company, mentor and internship information
        // then add the extracted information to the database
        const files = res.data.files;
        if (files && files.length) {
            for (const file of files) {
                const fileContent = (await readFileContent(file.id, drive)).text;
                const staj = extractInternship(fileContent);
                await addInternship(staj, file);
            }
        } else {
            console.log('No PDF files found.');
        }
    } catch (err) {
        console.error('An error occured: ', err);
    }
}

/*
    this function is used to read the content of a pdf file
*/
async function readFileContent(fileId: string, drive: any){
    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );
    const pdfStream = response.data;
    const pdfBuffer = await streamToBuffer(pdfStream);
    const pdfText = await pdf(pdfBuffer);
    return pdfText;
}





//extract student function
function extractStudent(text: any)
{
    /*STUDENT TABLE*/
    const tc = text.split("TC Kimlik No")[1].split("\n")[0].trim();
    const ad = text.split("Adı Soyadı")[1].split("\n")[0].trim().split(" ")[0];
    const soyad = text.split("Adı Soyadı")[1].split("\n")[0].trim().split(" ")[1];
    const email = text.split("Eposta Adresi")[1].split("\n")[0].trim();
    const ogrenci_no = text.split("Öğrenci No")[1].split("\n")[0].trim();
    const departmanAndGrade = text.split("Bölümü")[1].split("\n")[0].split("Sınıfı")[1].trim();
    const departman = departmanAndGrade.split("-")[0].trim();
    const student = {
        tc: tc,
        ad: ad,
        soyad: soyad,
        email: email,
        ogrenci_no: ogrenci_no,
        departman: departman,
    }
    return student;
}

//extract company function
function extractCompany(text: any)
{
    /*COMPANY TABLE*/
    const companyName = text.split("Staj Yapılmak İstenilen Kurum/Kuruluş Adı")[1].split("\n")[0].trim();
    const companyAddress = text.split("Kurum/Kuruluşun Adresi")[1].split("\nÖğrenci")[0].trim();
    const company = {
        ad: companyName,
        adres: companyAddress
    }

    return company;
}

//extract mentor function
function extractMentor(text: any)
{
    /*MENTOR TABLE*/
    const mentorName = text.split("Temas Kuracağı Kişinin Adı Soyadı")[1].split("\n")[0].trim().split(" ")[0];
    const mentorSurname = text.split("Temas Kuracağı Kişinin Adı Soyadı")[1].split("\n")[0].trim().split(" ")[1];
    const mentorPhone = text.split("Kurum/Kuruluşun Telefon /Faks Numarası")[1].split("\n")[0].trim().split("/")[0];
    const mentorEmail = text.split("Kurum/Kuruluşun Eposta Adresi")[1].split("\n")[0].trim();
    const mentor = {
        ad: mentorName,
        soyad: mentorSurname,
        numara: mentorPhone,
        eposta: mentorEmail
    }

    return mentor;
}

//extract internship function
function extractInternship(text: string)
{
    /*INTERNSHIP TABLE */

    const nthStaj = text.split("Zorunlu")[1].split("stajımı")[0].trim()[4];
    const tarihler_arasi = text.split("stajımı")[1].split("tarihleri")[0].trim();
    const begin_date = tarihler_arasi.split("-")[0].trim();
    const end_date = tarihler_arasi.split("-")[1].trim();
    const departmanAndGrade = text.split("Bölümü")[1].split("\n")[0].split("Sınıfı")[1].trim();
    const grade = departmanAndGrade.split("-")[1].trim();


    
    const student = extractStudent(text);
    const company = extractCompany(text);
    const mentor = extractMentor(text);



    const staj = {
        begin_date: begin_date,
        end_date: end_date,
        nthStaj: nthStaj,
        student: student,
        company: company,
        mentor: mentor,
        grade: grade
    }

    return staj;
}


async function addInternship(staj: any, file: any) {
    try {
        // Get repositories
        const departmentRepository = AppDataSource.getRepository(Department);
        const studentRepository = AppDataSource.getRepository(Student);
        const companyRepository = AppDataSource.getRepository(Company);
        const mentorRepository = AppDataSource.getRepository(Mentor);
        const internshipRepository = AppDataSource.getRepository(Internship);
        const fileRepository = AppDataSource.getRepository(File);

        let fileRepo = await fileRepository.findOne({ where: { name: file.name } });
        if (!fileRepo) {
            fileRepo = new File();
            fileRepo.name = file.name;
            fileRepo.drive_link = file.webViewLink;
            await fileRepository.save(fileRepo);
            //console.log("Dosya eklendi");
        } else {
            //console.log("Dosya zaten var");
            return ;
        }
        

        // Insert or get department
        let department = await departmentRepository.findOne({
            where: { department_name: staj.student.departman },
        });
        if (!department) {
            department = departmentRepository.create({ department_name: staj.student.departman });
            await departmentRepository.save(department);
            //console.log("Departman eklendi");
        } else {
            //console.log("Departman zaten var");
        }

        // Insert or get student
        let student = await studentRepository.findOne({
            where: { school_id: staj.student.ogrenci_no },
        });
        if (!student) {
            student = new Student();
            student.school_id = staj.student.ogrenci_no;
            student.turkish_id = staj.student.tc;
            student.name = staj.student.ad;
            student.surname = staj.student.soyad;
            student.email = staj.student.email;
            student.department = department;


            await studentRepository.save(student);
            //console.log("Öğrenci eklendi");
        } else {
            //console.log("Öğrenci zaten var");
        }

        // Insert or get company
        let company = await companyRepository.findOne({
            where: { name: staj.company.ad },
        });
        if (!company) {
            company = new Company();
            company.name = staj.company.ad;
            company.address = staj.company.adres;
            await companyRepository.save(company);
            //console.log("Şirket eklendi");
        } else {
            //console.log("Şirket zaten var");
        }

        // Insert or get mentor
        let mentor = await mentorRepository.findOne({
            where: { name: staj.mentor.ad },
        });
        if (!mentor) {
            mentor = new Mentor();
            mentor.name = staj.mentor.ad;
            mentor.surname = staj.mentor.soyad;
            mentor.phone_number = staj.mentor.numara;
            mentor.mail = staj.mentor.eposta;

            await mentorRepository.save(mentor);
            //console.log("Mentor eklendi");
        } else {
            //console.log("Mentor zaten var");
        }

        // Insert internship
        const internship = new Internship();
        internship.begin_date = new Date(staj.begin_date.split(".")[2], staj.begin_date.split(".")[1], staj.begin_date.split(".")[0], 0, 0, 0, 0);
        internship.end_date = new Date(staj.end_date.split(".")[2], staj.end_date.split(".")[1], staj.end_date.split(".")[0], 0, 0, 0, 0);
        internship.student = student;
        internship.company = company;
        internship.mentor = mentor;
        internship.type = staj.nthStaj;
        internship.name = fileRepo;
        internship.grade = parseInt(staj.grade);

        await internshipRepository.save(internship);

        //console.log("Staj başarıyla eklendi");
    } catch (err) {
        console.error("Bir hata oluştu: ", err);
    }
}



export { parsePdf };