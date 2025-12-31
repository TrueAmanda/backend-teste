import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // Validar configurações essenciais
  const jwtSecret = configService.get<string>('JWT_SECRET');
  if (!jwtSecret || jwtSecret === 'changeme') {
    console.warn('⚠️  JWT_SECRET não configurado ou usando valor padrão. Configure uma variável de ambiente segura.');
  }

  // Pipe de validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidNonWhitelisted: true,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  // Filtro de exceções global
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Interceptor de logging global
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle(configService.get('SWAGGER_TITLE', 'NextBuy API'))
    .setDescription(configService.get('SWAGGER_DESCRIPTION', 'API para o sistema de pedidos NextBuy'))
    .setVersion(configService.get('SWAGGER_VERSION', '1.0'))
    .addTag(configService.get('SWAGGER_TAG', 'nextbuy'))
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT obtido no endpoint /auth/login'
      },
      'access-token'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'NextBuy API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none } .swagger-ui .auth-wrapper { display: flex }',
  });

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Servir arquivos estáticos
  app.useStaticAssets(join(process.cwd(), 'uploads'), { 
    prefix: '/uploads',
    index: false,
  });

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation available at: http://localhost:${port}/api`);
}

bootstrap().catch((error) => {
  new Logger('Bootstrap').error('Failed to start application', error);
  process.exit(1);
});
