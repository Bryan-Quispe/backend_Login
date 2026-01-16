# 🎉 PROYECTO COMPLETADO: SerPlantas Backend Seguro

## ✨ Lo que se ha creado

Un **backend seguro en NestJS** con autenticación JWT, doble factor (2FA) con Google Authenticator y PostgreSQL en Docker Compose.

---

## 📁 Ubicación del Proyecto

```
c:\Users\rquis\OneDrive\Escritorio\7mo-Semestre\Moviles\Parcial 3\Ser_Plantas\backend-auth
```

---

## 🚀 Inicio Rápido (3 pasos)

### 1. Ir a la carpeta
```bash
cd "c:\Users\rquis\OneDrive\Escritorio\7mo-Semestre\Moviles\Parcial 3\Ser_Plantas\backend-auth"
```

### 2. Iniciar Docker Compose
```bash
docker-compose up -d
```

### 3. Verificar que funcione
```bash
curl http://localhost:3000/auth/register
```

**¡Listo! Backend corriendo en `http://localhost:3000`** ✅

---

## 📋 Características Implementadas

### ✅ Autenticación
- [x] Registro de usuarios
- [x] Login con usuario/contraseña
- [x] JWT con expiración de 10 minutos
- [x] Validación de credenciales
- [x] Encriptación de contraseñas con bcrypt

### ✅ Doble Factor (2FA)
- [x] Generación de secreto TOTP
- [x] Código QR para Google Authenticator
- [x] Validación de códigos 2FA
- [x] 10 códigos de respaldo
- [x] Login con 2FA

### ✅ Usuario
- [x] Campos: firstName, secondName, lastName, secondLastName
- [x] Username automático (primera letra nombre + apellido)
- [x] Email único
- [x] Contraseña con requisitos de seguridad
- [x] Timestamps de creación/actualización

### ✅ Base de Datos
- [x] PostgreSQL latest en Docker
- [x] Volumen persistente
- [x] Health checks
- [x] Sincronización automática de esquema

### ✅ Seguridad
- [x] Validación de DTOs
- [x] Guards JWT
- [x] CORS configurado
- [x] Manejo de errores seguro
- [x] Sin exposición de datos sensibles

### ✅ Documentación
- [x] README completo
- [x] Guía de uso detallada
- [x] Estructura del proyecto
- [x] Guía de deployment
- [x] FAQ
- [x] Colección Postman
- [x] Script de pruebas

---

## 📦 Contenido del Proyecto

```
backend-auth/
├── src/                                  # Código fuente TypeScript
│   ├── controllers/auth.controller.ts   # Endpoints
│   ├── services/auth.service.ts         # Lógica empresarial
│   ├── entities/user.entity.ts          # Modelo de DB
│   ├── dtos/                            # Validación de datos
│   ├── guards/jwt-auth.guard.ts         # Protección de rutas
│   ├── strategies/jwt.strategy.ts       # Estrategia Passport
│   ├── modules/auth.module.ts           # Módulo
│   ├── app.module.ts                    # Módulo raíz
│   └── main.ts                          # Punto de entrada
├── docker-compose.yml                   # Orquestación
├── Dockerfile                           # Imagen Docker
├── .env                                 # Variables de desarrollo
├── .env.production                      # Variables de producción
├── BACKEND_README.md                    # 📚 Documentación principal
├── USAGE_GUIDE.md                       # 📚 Guía de uso
├── PROJECT_STRUCTURE.md                 # 📚 Estructura del proyecto
├── DEPLOYMENT_GUIDE.md                  # 📚 Deployment
├── FAQ.md                               # 📚 Preguntas frecuentes
├── POSTMAN_COLLECTION.json              # 🧪 Colección para pruebas
├── test-api.sh                          # 🧪 Script de pruebas
└── package.json                         # Dependencias
```

---

## 🔑 Endpoints Principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register` | Registrar nuevo usuario |
| POST | `/auth/login` | Iniciar sesión |
| GET | `/auth/profile` | Obtener perfil (requiere auth) |
| GET | `/auth/2fa/setup` | Obtener QR para 2FA |
| POST | `/auth/2fa/enable` | Habilitar 2FA |
| POST | `/auth/login-2fa` | Login con 2FA |
| POST | `/auth/logout` | Cerrar sesión |

---

## 📱 Cómo Usar

### Registrar Usuario
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "secondName": "Carlos",
    "lastName": "González",
    "secondLastName": "Rodríguez",
    "email": "juan@example.com",
    "password": "Seguro123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jgonzález",
    "password": "Seguro123!"
  }'
```

### Obtener QR para 2FA
```bash
curl -X GET http://localhost:3000/auth/2fa/setup \
  -H "Authorization: Bearer {token}"
```

---

## 🗄️ Base de Datos

**PostgreSQL latest** con tabla `users`:

```sql
- id (UUID)
- firstName, secondName, lastName, secondLastName
- username (único, autogenerado)
- email
- password (encriptada con bcrypt)
- twoFactorEnabled (booleano)
- twoFactorSecret (TOTP)
- twoFactorBackupCodes (JSON)
- createdAt, updatedAt (timestamps)
```

---

## 🔐 Seguridad

1. ✅ **Contraseñas:** Encriptadas con bcrypt (no recuperables)
2. ✅ **JWT:** Expira en 10 minutos, firmado con secreto
3. ✅ **2FA:** Google Authenticator + códigos de respaldo
4. ✅ **Validación:** DTOs con class-validator
5. ✅ **Guards:** JWT authentication guard
6. ✅ **CORS:** Configurado para desarrollo

---

## 📚 Documentación Disponible

1. **[BACKEND_README.md](./BACKEND_README.md)** - Documentación principal
2. **[USAGE_GUIDE.md](./USAGE_GUIDE.md)** - Guía de uso detallada con ejemplos
3. **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Estructura y arquitectura
4. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Cómo desplegar en producción
5. **[FAQ.md](./FAQ.md)** - Preguntas frecuentes
6. **[POSTMAN_COLLECTION.json](./POSTMAN_COLLECTION.json)** - Para probar con Postman

---

## 🧪 Pruebas

### Opción 1: Script automático
```bash
bash test-api.sh
```

### Opción 2: Postman
- Importa `POSTMAN_COLLECTION.json`
- Cambia `{{base_url}}` por `http://localhost:3000`

### Opción 3: cURL manual
```bash
# Ver USAGE_GUIDE.md para ejemplos completos
```

---

## 🐳 Comandos Docker Útiles

```bash
# Iniciar
docker-compose up -d

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f backend

# Acceder a PostgreSQL
docker exec -it serplantas_db psql -U serplantas -d serplantas_db

# Detener
docker-compose down

# Eliminar todo incluyendo datos
docker-compose down -v
```

---

## 🔧 Configuración

### Variables de Entorno (.env)

```env
DB_HOST=postgres
DB_PORT=5432
DB_USER=serplantas
DB_PASSWORD=serplantas123
DB_NAME=serplantas_db
JWT_SECRET=tu-super-secreto
PORT=3000
NODE_ENV=development
```

**⚠️ En producción, CAMBIA:**
- `DB_PASSWORD`
- `JWT_SECRET` (usar: `openssl rand -base64 32`)

---

## 📊 Dependencias Principales

```
@nestjs/common          - Framework NestJS
@nestjs/typeorm        - ORM para base de datos
@nestjs/jwt            - JWT authentication
@nestjs/passport       - Passport integration
typeorm                 - Database ORM
pg                      - PostgreSQL driver
bcryptjs               - Password encryption
speakeasy              - TOTP/2FA generator
qrcode                 - QR code generation
class-validator        - DTO validation
```

---

## ⚡ Requisitos Mínimos

- Docker y Docker Compose
- 2GB RAM (para las imágenes)
- 100MB disco libre

---

## 🚀 Próximos Pasos

1. **Leer la documentación:** Empieza por [BACKEND_README.md](./BACKEND_README.md)
2. **Hacer pruebas:** Ejecuta `bash test-api.sh`
3. **Conectar frontend:** Usa los endpoints documentados
4. **Configurar para producción:** Sigue [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 📞 Soporte

- **Documentación:** Ver archivos `.md` en el proyecto
- **Preguntas frecuentes:** Ver [FAQ.md](./FAQ.md)
- **Troubleshooting:** Ver [BACKEND_README.md - Troubleshooting](./BACKEND_README.md#🐛-troubleshooting)

---

## 📝 Notas Importantes

### Durante Desarrollo
- JWT_SECRET es básico: OK (cambiar en producción)
- CORS acepta cualquier origen: OK (cambiar en producción)
- PostgreSQL sin backups: OK (configurar en producción)

### Para Producción
- Cambiar JWT_SECRET
- Configurar CORS específico
- Habilitar HTTPS/SSL
- Configurar backups automáticos
- Usar gestión de secretos
- Implementar rate limiting
- Configurar logs centralizados

---

## ✅ Checklist de Validación

- [x] Backend NestJS creado
- [x] Autenticación JWT implementada
- [x] 2FA con Google Authenticator funcionando
- [x] PostgreSQL en Docker
- [x] Encriptación de contraseñas
- [x] Validación de datos
- [x] Documentación completa
- [x] Ejemplos de uso
- [x] Scripts de prueba
- [x] Guía de deployment

---

## 🎯 Resumen

Tienes un **backend de producción listo** con:
- ✅ Autenticación segura
- ✅ Doble factor de seguridad
- ✅ Base de datos persistente
- ✅ Documentación completa
- ✅ Scripts de prueba
- ✅ Guía de deployment

**¡Puedes empezar a usarlo ahora mismo!** 🚀

---

**Creado:** Enero 15, 2024
**Versión:** 1.0.0
**Estado:** ✅ Producción Ready (con ajustes de seguridad)
