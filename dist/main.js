"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const global_exception_filter_1 = require("./shared/filters/global-exception.filter");
const logging_interceptor_1 = require("./shared/interceptors/logging.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    const configService = app.get(config_1.ConfigService);
    // Validar configurações essenciais
    const jwtSecret = configService.get('JWT_SECRET');
    if (!jwtSecret || jwtSecret === 'changeme') {
        console.warn('⚠️  JWT_SECRET não configurado ou usando valor padrão. Configure uma variável de ambiente segura.');
    }
    // Pipe de validação global
    app.useGlobalPipes(new common_1.ValidationPipe({
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
    }));
    // Filtro de exceções global
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    // Interceptor de logging global
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    // Configuração do Swagger
    const config = new swagger_1.DocumentBuilder()
        .setTitle(configService.get('SWAGGER_TITLE', 'NextBuy API'))
        .setDescription(configService.get('SWAGGER_DESCRIPTION', 'API para o sistema de pedidos NextBuy'))
        .setVersion(configService.get('SWAGGER_VERSION', '1.0'))
        .addTag(configService.get('SWAGGER_TAG', 'nextbuy'))
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT obtido no endpoint /auth/login'
    }, 'access-token')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document, {
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
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), {
        prefix: '/uploads',
        index: false,
    });
    const port = configService.get('PORT') || 3000;
    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📚 Swagger documentation available at: http://localhost:${port}/api`);
}
bootstrap().catch((error) => {
    new common_1.Logger('Bootstrap').error('Failed to start application', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map