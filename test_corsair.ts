import * as dotenv from 'dotenv';
dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('PGPASSWORD:', process.env.PGPASSWORD);
console.log('PGUSER:', process.env.PGUSER);
