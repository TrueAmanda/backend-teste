// Mock global para console methods em ambiente de teste
// Reduz ruído nos logs durante execução dos testes
global.console = {
  ...console,
  // Silenciar logs específicos em teste se necessário
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock para process.env - Variáveis de ambiente para testes
// Evita dependência de serviços externos durante testes
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  MONGO_URI: 'mongodb://localhost:27017/test',
  REDIS_URL: 'redis://localhost:6379',
  JWT_SECRET: 'test-secret',
  AWS_ACCESS_KEY_ID: 'test-key',
  AWS_SECRET_ACCESS_KEY: 'test-secret',
  AWS_REGION: 'us-east-2',
  S3_BUCKET: 'test-bucket',
  UPLOAD_DIR: './test-uploads',
};

// Mock para módulos externos - Isolamento de dependências
// BullMQ para filas de processamento assíncrono
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
    getJob: jest.fn(),
  })),
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn(),
  })),
}));

jest.mock('axios');
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/lib-storage');
