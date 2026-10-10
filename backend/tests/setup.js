process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'teste-teste-teste-teste-teste-teste-teste-123456';
process.env.CORS_ORIGINS = 'http://localhost:5173';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://x:x@127.0.0.1:5432/x';
process.env.BCRYPT_COST = '10';
