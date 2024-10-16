import { DataSource } from 'typeorm';
import { Company } from './src/entities/company.entitiy';
import { File } from './src/entities/file.entitiy';
import { Internship } from './src/entities/internship.entitiy';
import { Mentor } from './src/entities/mentor.entitiy';
import { Student } from './src/entities/student.entitiy';
import { EUser } from './src/entities/euser.entity';

export const AppDataSource = new DataSource({
  type: 'postgres', // or your database type (e.g., 'postgres')
  host: 'musabkardes.com.tr',
  port: 5555,
  username: 'interndbuser',
  password: 'interndbpass',
  database: 'interndb',
  synchronize: true,
  logging: false,
  entities: [Company, File, Internship, Mentor, Student, EUser],
  migrations: [],
  subscribers: [],
});
