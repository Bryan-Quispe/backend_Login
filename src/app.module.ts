import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth.module';
import { User } from './entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'serplantas',
      password: process.env.DB_PASSWORD || 'serplantas123',
      database: process.env.DB_NAME || 'serplantas_db',
      entities: [User],
      synchronize: true, // Esto creará las tablas automáticamente en Neon
      logging: true,
      
      // --- INICIO DEL CAMBIO ---
      // Si estamos en producción (no localhost), activamos SSL
      ssl: process.env.DB_HOST !== 'localhost', 
      extra: {
        ssl: process.env.DB_HOST !== 'localhost' 
          ? { rejectUnauthorized: false } 
          : null,
      },
      // --- FIN DEL CAMBIO ---
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
