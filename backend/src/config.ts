import dotenv from 'dotenv';
dotenv.config();

export const API_PORT = parseInt(process.env.API_PORT || '3000', 10);
export const API_URL = process.env.API_URL || 'http://localhost';

export const POSTGRESQL_HOST = process.env.POSTGRESQL_HOST;
export const POSTGRESQL_PORT = parseInt(process.env.POSTGRESQL_PORT || '5432', 10);
export const POSTGRESQL_DB = process.env.POSTGRESQL_DB;
export const POSTGRESQL_USER = process.env.POSTGRESQL_USER;
export const POSTGRESQL_PWD = process.env.POSTGRESQL_PWD;
export const MIGRATE_DB = process.env.MIGRATE_DB === 'true';

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID;