"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const company_entitiy_1 = require("./src/entities/company.entitiy");
const file_entitiy_1 = require("./src/entities/file.entitiy");
const internship_entitiy_1 = require("./src/entities/internship.entitiy");
const mentor_entitiy_1 = require("./src/entities/mentor.entitiy");
const student_entitiy_1 = require("./src/entities/student.entitiy");
const user_entity_1 = require("./src/entities/user.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres', // or your database type (e.g., 'postgres')
    host: 'musabkardes.com.tr',
    port: 5555,
    username: 'interndbuser',
    password: 'interndbpass',
    database: 'interndb',
    synchronize: true,
    logging: false,
    entities: [company_entitiy_1.Company, file_entitiy_1.File, internship_entitiy_1.Internship, mentor_entitiy_1.Mentor, student_entitiy_1.Student, user_entity_1.User],
    migrations: [],
    subscribers: [],
});
//# sourceMappingURL=ormconfig.js.map