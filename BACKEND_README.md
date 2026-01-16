# SerPlantas Backend - Autenticación Segura

Backend seguro con NestJS que incluye autenticación con JWT, doble factor (2FA) con Google Authenticator y PostgreSQL.

## 🔒 Características de Seguridad

- ✅ Registro e inicio de sesión seguro
- ✅ Contraseñas encriptadas con bcrypt
- ✅ JWT con expiración de 10 minutos
- ✅ Autenticación de Doble Factor (2FA) con Google Authenticator
- ✅ Códigos de respaldo para 2FA
- ✅ Validación de datos con class-validator
- ✅ Base de datos PostgreSQL en Docker
- ✅ CORS habilitado
- ✅ Manejo de errores robusto

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Node.js 18+ (opcional, si no usas Docker)
- npm o yarn

## 🚀 Inicio Rápido

### Opción 1: Con Docker Compose (Recomendado)

```bash
# Navega a la carpeta del backend
cd backend-auth

# Inicia los servicios con Docker Compose
docker-compose up -d

# La aplicación estará disponible en http://localhost:3000
```

### Opción 2: Sin Docker (desarrollo local)

```bash
# Instala las dependencias
npm install

# Asegúrate de tener PostgreSQL corriendo localmente
# Actualiza las variables de entorno en .env si es necesario

# Inicia la aplicación
npm run start:dev
```

## 📝 Variables de Entorno (.env)

```
DB_HOST=postgres          # Host de PostgreSQL (localhost si es local)
DB_PORT=5432             # Puerto de PostgreSQL
DB_USER=serplantas       # Usuario de PostgreSQL
DB_PASSWORD=serplantas123 # Contraseña de PostgreSQL
DB_NAME=serplantas_db    # Nombre de la base de datos

JWT_SECRET=tu-super-secreto # Cambia esto en producción

PORT=3000                # Puerto de la aplicación
NODE_ENV=development
```

## 🔑 Endpoints de la API

### 1. Registro de Usuario
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "Juan",
  "secondName": "Carlos",
  "lastName": "González",
  "secondLastName": "Rodríguez",
  "email": "juan@example.com",
  "password": "Seguro123!"
}
```

**Respuesta:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "uuid-del-usuario",
    "username": "jgonzález",
    "email": "juan@example.com",
    "firstName": "Juan"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Nota:** El usuario se crea automáticamente con:
- Username: Primera letra del nombre + Apellido (ejemplo: J + González = jgonzález)

### 2. Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "jgonzález",
  "password": "Seguro123!"
}
```

**Respuesta (sin 2FA):**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": "uuid-del-usuario",
    "username": "jgonzález",
    "email": "juan@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta (con 2FA):**
```json
{
  "message": "Se requiere autenticación de doble factor",
  "accessToken": "token-temporal-5-minutos",
  "requiresTwoFactor": true
}
```

### 3. Generar QR para 2FA
```http
GET /auth/2fa/setup
Authorization: Bearer {accessToken}
```

**Respuesta:**
```json
{
  "secret": "JBSWY3DPEBLW64TMMQ======",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "message": "Escanea el código QR con Google Authenticator para habilitar 2FA"
}
```

### 4. Habilitar 2FA
```http
POST /auth/2fa/enable
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "code": "123456"
}
```

**Respuesta:**
```json
{
  "message": "2FA habilitado exitosamente",
  "backupCodes": ["ABCD1234", "EFGH5678", ...],
  "warning": "Guarda estos códigos en un lugar seguro..."
}
```

### 5. Login con 2FA
```http
POST /auth/login-2fa
Content-Type: application/json

{
  "token": "token-temporal-del-login",
  "code": "123456"
}
```

**Respuesta:**
```json
{
  "message": "Autenticación de doble factor exitosa",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-del-usuario",
    "username": "jgonzález",
    "email": "juan@example.com"
  }
}
```

### 6. Obtener Perfil
```http
GET /auth/profile
Authorization: Bearer {accessToken}
```

**Respuesta:**
```json
{
  "message": "Perfil obtenido exitosamente",
  "user": {
    "sub": "uuid-del-usuario",
    "username": "jgonzález"
  }
}
```

### 7. Logout
```http
POST /auth/logout
Authorization: Bearer {accessToken}
```

**Respuesta:**
```json
{
  "message": "Logout exitoso"
}
```

## 🔐 Requisitos de Contraseña

La contraseña debe cumplir con:
- Mínimo 8 caracteres
- Contener al menos una mayúscula
- Contener al menos una minúscula
- Contener números o caracteres especiales

Ejemplo válido: `Seguro123!`

## 📱 Configurar Google Authenticator

1. Descarga Google Authenticator (iOS o Android)
2. Obtén el QR en `/auth/2fa/setup`
3. Escanea el código QR en tu teléfono
4. Ingresa el código de 6 dígitos en `/auth/2fa/enable`
5. Guarda los códigos de respaldo en un lugar seguro

## 🐳 Comandos Útiles de Docker

```bash
# Ver logs de la aplicación
docker-compose logs -f backend

# Ver logs de PostgreSQL
docker-compose logs -f postgres

# Parar los servicios
docker-compose down

# Reconstruir las imágenes
docker-compose build --no-cache

# Acceder a PostgreSQL
docker exec -it serplantas_db psql -U serplantas -d serplantas_db
```

## 🗄️ Estructura de la Base de Datos

### Tabla: users
```sql
- id (UUID, PK)
- firstName (VARCHAR)
- secondName (VARCHAR)
- lastName (VARCHAR)
- secondLastName (VARCHAR)
- username (VARCHAR, UNIQUE)
- email (VARCHAR)
- password (VARCHAR, encriptada)
- twoFactorEnabled (BOOLEAN)
- twoFactorSecret (VARCHAR, nullable)
- twoFactorBackupCodes (JSON)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

## 🛡️ Seguridad en Producción

Antes de deplorar a producción:

1. **Cambiar JWT_SECRET:**
   ```bash
   # Generar una clave segura
   openssl rand -base64 32
   ```

2. **Configurar HTTPS**
3. **Habilitar rate limiting**
4. **Validar CORS más restrictivo**
5. **Usar variables de entorno seguras**
6. **Auditar las dependencias** con `npm audit`
7. **Actualizar el PostgreSQL** a una versión específica en producción
8. **Configurar backups** de la base de datos
9. **Usar secrets management** (AWS Secrets Manager, Azure Key Vault, etc.)

## 📝 Notas Importantes

- Los tokens JWT expiran en **10 minutos**
- Los códigos 2FA tienen una ventana de validación de 2 ventanas de tiempo
- Los códigos de respaldo se pueden usar si pierdes acceso a Google Authenticator
- La base de datos se sincroniza automáticamente con las entidades (desarrollo)

## 🐛 Troubleshooting

### "Connection refused" en PostgreSQL
```bash
# Verifica que el contenedor de PostgreSQL está corriendo
docker-compose ps

# Reinicia los servicios
docker-compose restart
```

### "Token inválido o expirado"
- El token JWT dura 10 minutos
- Realiza un nuevo login para obtener un nuevo token

### Error en 2FA
- Asegúrate de que la hora del servidor y el teléfono estén sincronizados
- Intenta con un código de respaldo

## 📚 Tecnologías Utilizadas

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación basada en tokens
- **Passport** - Estrategia de autenticación
- **Speakeasy** - Generador de códigos TOTP
- **QRCode** - Generador de códigos QR
- **Bcryptjs** - Encriptación de contraseñas
- **Docker** - Containerización
- **Class-validator** - Validación de datos

## 📄 Licencia

MIT

## 👨‍💻 Autor

SerPlantas Team

---

**¿Preguntas?** Revisa la documentación oficial de [NestJS](https://docs.nestjs.com) y [Speakeasy](https://github.com/speakeasyjs/speakeasy).
