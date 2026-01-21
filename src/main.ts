import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar validación global con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Habilitar CORS
app.enableCors({
  origin: true, // <--- CAMBIO AQUÍ: 'true' en lugar de '*'
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('🌱 SerPlantas API')
    .setDescription(
      'Backend seguro con autenticación JWT, 2FA con Google Authenticator y PostgreSQL',
    )
    .setVersion('1.0.0')
    .addTag('Autenticación', 'Endpoints de registro, login y autenticación')
    .addTag('2FA', 'Endpoints para doble factor de autenticación')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .setContact(
      'SerPlantas Team',
      'https://github.com',
      'contact@serplantas.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
    },
    customCss: `
      .topbar { display: none; }
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { font-size: 28px; }
    `,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`✅ Aplicación escuchando en puerto ${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
  console.log(`🔄 JSON Swagger: http://localhost:${port}/api-json`);
}
bootstrap();

