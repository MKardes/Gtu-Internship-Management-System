import { DataSource } from 'typeorm';
import { Company } from './src/entities/company.entity';
import { File } from './src/entities/file.entity';
import { Internship } from './src/entities/internship.entity';
import { Mentor } from './src/entities/mentor.entity';
import { Student } from './src/entities/student.entity';
import { User } from './src/entities/user.entity';
import { Department } from './src/entities/department.entity';
import { VerifCode } from './src/entities/verifcode.entity';
import { Term } from './src/entities/term.entity';

import { 
  MIGRATE_DB,
  POSTGRESQL_DB,
  POSTGRESQL_HOST,
  POSTGRESQL_PORT,
  POSTGRESQL_USER,
  POSTGRESQL_PWD,
 } from './src/config';

export const AppDataSource = new DataSource({
  type: 'postgres', // or your database type (e.g., 'postgres')
  host: POSTGRESQL_HOST,
  port: POSTGRESQL_PORT,
  username: POSTGRESQL_USER,
  password: POSTGRESQL_PWD,
  database: POSTGRESQL_DB,
  synchronize: MIGRATE_DB,
  logging: false,
  entities: [Company, File, Internship, Mentor, Student, User, Department, VerifCode, Term],
  migrations: [],
  subscribers: [],
});
