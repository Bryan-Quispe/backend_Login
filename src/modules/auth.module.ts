import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config'; // 1. Importar ConfigService
import { User } from '../entities/user.entity';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { JwtStrategy } from '../strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    // 2. Cambiar register por registerAsync
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // 3. Leer la variable de forma segura
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          // OJO: 10m es muy poco tiempo para una app web normal.
          // Si no tienes "Refresh Token", el usuario será expulsado cada 10 min.
          // Sugiero '1h' o '1d' para empezar.
          expiresIn: '1h' 
        },
      }),
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
