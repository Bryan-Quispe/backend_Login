# 📦 Estructura del Proyecto SerPlantas Backend

```
backend-auth/
├── src/
│   ├── controllers/
│   │   └── auth.controller.ts          # Endpoints de autenticación
│   ├── services/
│   │   └── auth.service.ts              # Lógica de autenticación
│   ├── entities/
│   │   └── user.entity.ts               # Modelo de Usuario
│   ├── dtos/
│   │   ├── create-user.dto.ts           # Validación registro
│   │   └── login.dto.ts                 # Validación login/2FA
│   ├── guards/
│   │   └── jwt-auth.guard.ts            # Protección de rutas
│   ├── strategies/
│   │   └── jwt.strategy.ts              # Estrategia Passport JWT
│   ├── modules/
│   │   └── auth.module.ts               # Módulo de autenticación
│   ├── app.module.ts                    # Módulo principal
│   ├── app.controller.ts                # Controlador raíz
│   ├── app.service.ts                   # Servicio raíz
│   └── main.ts                          # Punto de entrada
├── docker-compose.yml                   # Orquestación de contenedores
├── Dockerfile                           # Imagen Docker del backend
├── .env                                 # Variables de desarrollo
├── .env.production                      # Variables de producción
├── .gitignore                           # Archivos ignorados
├── package.json                         # Dependencias
├── tsconfig.json                        # Configuración TypeScript
├── BACKEND_README.md                    # Documentación principal
├── USAGE_GUIDE.md                       # Guía de uso detallada
├── DEPLOYMENT_GUIDE.md                  # Guía de deployment
├── POSTMAN_COLLECTION.json              # Colección para pruebas
├── run-docker.sh                        # Script para Docker
└── README.md                            # README original NestJS
```

## 🔄 Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRO DE USUARIO                       │
│                                                              │
│  POST /auth/register                                         │
│  ├─ Validar datos (firstName, lastName, email, password)   │
│  ├─ Generar username: primer letra + apellido              │
│  ├─ Encriptar contraseña con bcrypt                        │
│  ├─ Guardar en PostgreSQL                                  │
│  └─ Retornar JWT (10 minutos)                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      LOGIN BÁSICO                            │
│                                                              │
│  POST /auth/login                                            │
│  ├─ Verificar username existe                              │
│  ├─ Validar contraseña (bcrypt)                            │
│  ├─ Si 2FA NO está habilitado                              │
│  │  └─ Retornar JWT (10 minutos)                           │
│  └─ Si 2FA SÍ está habilitado                              │
│     └─ Retornar token temporal (5 minutos)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  CONFIGURAR 2FA (Opcional)                   │
│                                                              │
│  GET /auth/2fa/setup (Auth requerida)                       │
│  ├─ Generar secreto TOTP con speakeasy                     │
│  ├─ Generar código QR                                       │
│  └─ Retornar QR para Google Authenticator                  │
│                                                              │
│  POST /auth/2fa/enable (Auth requerida)                     │
│  ├─ Validar código TOTP                                     │
│  ├─ Generar 10 códigos de respaldo                         │
│  └─ Guardar secreto y códigos en DB                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    LOGIN CON 2FA                             │
│                                                              │
│  POST /auth/login-2fa (Token temporal requerido)            │
│  ├─ Validar código TOTP desde Google Authenticator         │
│  ├─ Si válido: Retornar JWT (10 minutos)                   │
│  ├─ Si inválido: Verificar código de respaldo              │
│  └─ Eliminar código de respaldo usado                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   RUTAS PROTEGIDAS                           │
│                                                              │
│  GET /auth/profile (JWT en header)                          │
│  POST /auth/logout (JWT en header)                          │
│  Cualquier ruta con @UseGuards(JwtAuthGuard)               │
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ Modelo de Datos

```sql
users {
  id: UUID (primary key)
  firstName: string          -- Juan
  secondName: string         -- Carlos
  lastName: string           -- González
  secondLastName: string     -- Rodríguez
  username: string (unique)  -- jgonzález (auto-generated)
  email: string
  password: string (bcrypt)
  twoFactorEnabled: boolean
  twoFactorSecret: string    -- Base32 TOTP secret
  twoFactorBackupCodes: JSON -- ["CODE1", "CODE2", ...]
  createdAt: timestamp
  updatedAt: timestamp
}
```

## 🔐 Seguridad Implementada

```
┌──────────────────────────────────────────┐
│          CAPAS DE SEGURIDAD              │
├──────────────────────────────────────────┤
│ 1. Validación de datos (class-validator) │
│ 2. Encriptación de contraseñas (bcrypt)  │
│ 3. JWT con expiración (10 min)           │
│ 4. 2FA con Google Authenticator          │
│ 5. Códigos de respaldo                   │
│ 6. Guards de autenticación (Passport)    │
│ 7. CORS configurado                      │
│ 8. Manejo de errores seguro              │
└──────────────────────────────────────────┘
```

## 🐳 Docker Compose - Servicios

```
serplantas_network
│
├── serplantas_db (PostgreSQL:latest)
│   ├── Puerto: 5432
│   ├── Volume: postgres_data
│   └── Health Check: pg_isready
│
└── serplantas_backend (NestJS)
    ├── Puerto: 3000
    ├── Depende de: postgres (healthy)
    ├── Modo: start:dev (desarrollo)
    └── Volúmenes: . y /app/node_modules
```

## 📊 Dependencias Principales

```json
{
  "@nestjs/common": "^10",           // Core framework
  "@nestjs/core": "^10",             // NestJS core
  "@nestjs/typeorm": "^10",          // Database ORM
  "@nestjs/jwt": "^11",              // JWT authentication
  "@nestjs/passport": "^10",         // Passport integration
  "@nestjs/config": "^3",            // Environment variables
  "typeorm": "^0.3",                 // ORM
  "pg": "^8",                        // PostgreSQL driver
  "passport-jwt": "^4",              // JWT strategy
  "bcryptjs": "^2",                  // Password encryption
  "speakeasy": "^2",                 // TOTP/2FA
  "qrcode": "^1",                    // QR generation
  "class-validator": "^0",           // DTO validation
  "class-transformer": "^0"          // DTO transformation
}
```

## 🎯 Endpoints Resumen

| Método | Ruta | Auth | 2FA | Descripción |
|--------|------|------|-----|-------------|
| POST | /auth/register | ❌ | ❌ | Registrar usuario |
| POST | /auth/login | ❌ | ⚡ | Login básico |
| GET | /auth/2fa/setup | ✅ | ❌ | Obtener QR para 2FA |
| POST | /auth/2fa/enable | ✅ | ❌ | Habilitar 2FA |
| POST | /auth/login-2fa | ⏱️ | ✅ | Login con 2FA |
| GET | /auth/profile | ✅ | ❌ | Obtener perfil |
| POST | /auth/logout | ✅ | ❌ | Cerrar sesión |

**Leyenda:**
- ✅ Requerido
- ❌ No requerido
- ⚡ Condicional (si 2FA habilitado)
- ⏱️ Token temporal

## ⚙️ Configuración

### Variables de Entorno Requeridas

```
DB_HOST=postgres
DB_PORT=5432
DB_USER=serplantas
DB_PASSWORD=serplantas123
DB_NAME=serplantas_db
JWT_SECRET=tu-super-secreto
PORT=3000
NODE_ENV=development
```

### Requisitos de Contraseña

- 8+ caracteres
- 1 mayúscula (A-Z)
- 1 minúscula (a-z)
- 1 número (0-9) O especial (!@#$%^&*)

## 🚀 Comandos Rápidos

```bash
# Desarrollo local
npm run start:dev

# Compilar
npm run build

# Docker Compose
docker-compose up -d
docker-compose down
docker-compose logs -f

# Acceder a PostgreSQL
docker exec -it serplantas_db psql -U serplantas -d serplantas_db
```

---

**¡Proyecto listo para usar!** 🎉
