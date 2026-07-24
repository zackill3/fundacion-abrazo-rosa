import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

export const config = {
  port: Number(process.env['API_PORT'] ?? 3000),
  frontendOrigin: process.env['FRONTEND_ORIGIN'] ?? 'http://localhost:4200',
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] ?? '8h',
  adminSignupCode: required('ADMIN_SIGNUP_CODE'),
  database: {
    host: required('DB_HOST'),
    port: Number(process.env['DB_PORT'] ?? 3306),
    database: required('DB_DATABASE'),
    user: required('DB_USERNAME'),
    password: required('DB_PASSWORD'),
    ssl: process.env['DB_SSL'] !== 'false' ? { rejectUnauthorized: false } : undefined,
  },
};
