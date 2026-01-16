# ❓ Preguntas Frecuentes - SerPlantas Backend

## 🚀 Instalación y Setup

### P: ¿Cómo inicio el proyecto?

**R:** Hay dos formas:

**Con Docker (Recomendado):**
```bash
cd backend-auth
docker-compose up -d
```

**Sin Docker (Desarrollo local):**
```bash
npm install
# Asegurate de tener PostgreSQL corriendo localmente
npm run start:dev
```

---

### P: ¿Qué puertos usa?

**R:** 
- **Backend:** Puerto 3000
- **PostgreSQL:** Puerto 5432

Si necesitas cambiarlos, edita `docker-compose.yml` o `.env`

---

### P: ¿Dónde están los logs?

**R:**
```bash
# Ver logs en tiempo real
docker-compose logs -f backend

# Ver solo logs de PostgreSQL
docker-compose logs -f postgres

# Guardar logs en archivo
docker-compose logs backend > logs.txt
```

---

## 🔐 Autenticación

### P: ¿Cuánto tiempo dura el token JWT?

**R:** 10 minutos. Después expira y debes hacer un nuevo login para obtener otro.

---

### P: ¿Cómo se genera el username?

**R:** Automáticamente con:
- **Primera letra del firstName + lastName**
- Convertido a minúsculas
- Ejemplos:
  - Juan González → `jgonzález`
  - María Rodriguez → `mrodriguez`
  - Carlos López → `clopez`

---

### P: ¿Puedo cambiar el username?

**R:** Actualmente no está implementado. Cada usuario tiene su username generado automáticamente y no se puede cambiar. Si necesitas esta funcionalidad, abre un issue.

---

## 🔑 Contraseñas

### P: ¿Qué requisitos tiene la contraseña?

**R:** Debe cumplir TODOS estos:
- ✅ 8 o más caracteres
- ✅ Al menos UNA mayúscula (A-Z)
- ✅ Al menos UNA minúscula (a-z)
- ✅ Al menos UN número (0-9) O un carácter especial (!@#$%^&*)

**Ejemplos válidos:**
- `Seguro123!`
- `MiPassword2024`
- `Test@Password`
- `Admin123`

**Ejemplos INVÁLIDOS:**
- `password` (sin mayúscula, sin número)
- `PASSWORD123` (sin minúscula)
- `Pass1` (menos de 8 caracteres)
- `abcdefgh` (sin mayúscula, sin número)

---

### P: ¿Se puede cambiar la contraseña?

**R:** No está implementado actualmente. Las contraseñas son inmutables. Para cambiar, deberías:
1. Borrar el usuario
2. Crear uno nuevo

Esto se puede mejorar en versiones futuras.

---

## 🔐 Doble Factor (2FA)

### P: ¿Qué es 2FA?

**R:** Two-Factor Authentication (Autenticación de Doble Factor). Es una capa extra de seguridad donde:
1. Ingresa usuario y contraseña (Factor 1)
2. Confirma con código de Google Authenticator (Factor 2)

Así, incluso si alguien tiene tu contraseña, no puede acceder sin el teléfono.

---

### P: ¿Cómo configuro Google Authenticator?

**R:**
1. Descarga la app "Google Authenticator" en tu teléfono
2. Obtén el QR: `GET /auth/2fa/setup` (requiere token)
3. En la app, toca "+" y "Escanear código QR"
4. Escanea el código recibido
5. Obtén el código de 6 dígitos
6. Envía el código a `POST /auth/2fa/enable`
7. Guarda los **códigos de respaldo** en un lugar seguro

---

### P: ¿Qué pasa si pierdo el teléfono?

**R:** Usa uno de los **10 códigos de respaldo** que recibiste al habilitar 2FA. Cada código se puede usar UNA sola vez.

```bash
# Usar código de respaldo
curl -X POST http://localhost:3000/auth/login-2fa \
  -H "Content-Type: application/json" \
  -d '{
    "token": "token-temporal",
    "code": "ABCD1234"
  }'
```

---

### P: ¿Tengo que usar 2FA?

**R:** NO, es opcional. Puedes usar solo usuario y contraseña. Pero es MUY recomendado habilitar 2FA para mayor seguridad.

---

### P: ¿Puedo deshabilitar 2FA?

**R:** No está implementado. Una vez habilitado, no se puede deshabilitar desde la API. Para esto deberías:
1. Acceder directamente a la base de datos
2. O agregar un endpoint de administración

---

### P: ¿Los códigos de 6 dígitos expiran?

**R:** No, pero se actualizan cada 30 segundos. Si tardas en copiar el código, espera 30 segundos y tendrás uno nuevo.

---

## 🗄️ Base de Datos

### P: ¿Dónde se almacena la contraseña?

**R:** Encriptada con **bcrypt** (algoritmo de hash). No se puede recuperar, solo validar. Ejemplo en DB:

```
$2a$10$V9dfQ.9.Zw3Q.9.Zw3Q.u3OMp.9.Zw3Q.9.Zw3Q.9.Zw3Q.9.Zw
```

---

### P: ¿Cómo accedo a PostgreSQL?

**R:**
```bash
# Con Docker
docker exec -it serplantas_db psql -U serplantas -d serplantas_db

# Ver usuarios
SELECT id, username, email, "twoFactorEnabled", "createdAt" FROM users;

# Ver cantidad de usuarios
SELECT COUNT(*) FROM users;

# Salir
\q
```

---

### P: ¿Cómo hago backup de la DB?

**R:**
```bash
# Backup completo
docker exec serplantas_db pg_dump -U serplantas serplantas_db > backup.sql

# Con compresión
docker exec serplantas_db pg_dump -U serplantas serplantas_db | gzip > backup.sql.gz

# Restaurar
docker exec -i serplantas_db psql -U serplantas serplantas_db < backup.sql
```

---

### P: ¿Puedo usar otra base de datos?

**R:** Sí, el proyecto usa **TypeORM**, así que puedes cambiar a:
- MySQL
- MariaDB
- Oracle
- SQL Server

Solo actualiza `.env` y `app.module.ts`

---

## 🐳 Docker

### P: ¿Docker Compose qué hace?

**R:** Orquesta dos contenedores:
1. **PostgreSQL** - Base de datos
2. **NestJS Backend** - Tu aplicación

Comunicados por red `serplantas_network`

---

### P: ¿Los datos persisten si apago Docker?

**R:** **SÍ**, porque la DB usa un volumen:
```yaml
volumes:
  postgres_data:  # Los datos se guardan aquí
```

---

### P: ¿Cómo elimino TODO incluyendo datos?

**R:**
```bash
# ⚠️ CUIDADO: Esto BORRA TODO

docker-compose down -v
# -v = elimina volúmenes también
```

---

### P: ¿Cómo reconstruyo las imágenes?

**R:**
```bash
docker-compose build --no-cache

# Luego inicia normalmente
docker-compose up -d
```

---

## 🔒 Seguridad

### P: ¿Esto es seguro para producción?

**R:** Parcialmente. Antes de producción:

- [ ] Cambiar `JWT_SECRET` a algo seguro
- [ ] Cambiar contraseña de PostgreSQL
- [ ] Configurar HTTPS/SSL
- [ ] Habilitar CORS solo para tu dominio
- [ ] Configurar rate limiting
- [ ] Usar gestión de secretos (AWS, Azure, etc.)
- [ ] Hacer auditorías de seguridad
- [ ] Configurar backups automáticos

Ver `DEPLOYMENT_GUIDE.md` para más detalles.

---

### P: ¿Dónde almaceno JWT_SECRET?

**R:** 
- **Desarrollo:** `.env`
- **Producción:** 
  - AWS Secrets Manager
  - Azure Key Vault
  - HashiCorp Vault
  - Variables de entorno del servidor

**Nunca** comitas secretos a Git.

---

### P: ¿Qué información contiene el JWT?

**R:** Solo información NO sensible:
```json
{
  "sub": "uuid-del-usuario",
  "username": "jgonzález",
  "iat": 1234567890,
  "exp": 1234567890
}
```

La contraseña NUNCA se incluye.

---

## 📱 API

### P: ¿Cómo pruebo los endpoints?

**R:** Varias opciones:

**1. Con cURL:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Juan",...}'
```

**2. Con Postman:**
- Importa `POSTMAN_COLLECTION.json`

**3. Con Thunder Client (VS Code):**
- Instala extensión
- Usa la colección

**4. Con script bash:**
```bash
bash test-api.sh
```

---

### P: ¿Qué pasa con CORS?

**R:** Actualmente acepta todas las origins:
```javascript
enableCors({
  origin: '*',  // Cualquiera
})
```

**En producción, cambia a:**
```javascript
enableCors({
  origin: 'https://mi-dominio.com'
})
```

---

### P: ¿Cómo manejo errores?

**R:** La API retorna estados HTTP apropiados:

```
200 - OK (éxito)
201 - Created (usuario creado)
400 - Bad Request (datos inválidos)
401 - Unauthorized (sin autenticación)
404 - Not Found (usuario no existe)
500 - Internal Server Error (error del servidor)
```

---

## 🚀 Deployment

### P: ¿Cómo despliego esto?

**R:** Ver `DEPLOYMENT_GUIDE.md` para opciones:
- DigitalOcean App Platform
- AWS ECS
- VPS tradicional (Linode, DigitalOcean)
- Heroku
- Railway.app

---

### P: ¿Cuál es el hosting más barato?

**R:** Opciones económicas:
1. **Railway.app** - Gratis primeros $5/mes
2. **Fly.io** - Gratis tier generoso
3. **Render** - $0.007/hora aprox
4. **DigitalOcean** - $6/mes

---

## 🐛 Troubleshooting

### P: Error "Connection refused" a PostgreSQL

**R:**
```bash
# Verifica que está corriendo
docker-compose ps

# Reinicia
docker-compose restart postgres

# Ver logs
docker-compose logs postgres
```

---

### P: Error "Token inválido"

**R:**
- El token expiró (10 minutos)
- JWT_SECRET cambió
- Token está corrupto

**Solución:** Haz un nuevo login

---

### P: Error "Código 2FA inválido"

**R:** Causas posibles:
1. Reloj del servidor desincronizado
2. Reloj del teléfono desincronizado
3. Esperaste más de 30 segundos
4. Código incorrecto

**Solución:** 
- Sincroniza la hora del servidor
- Sincroniza la hora del teléfono
- Usa un código de respaldo

---

### P: ¿Cómo veo qué está fallando?

**R:**
```bash
# Terminal 1: Ver logs en tiempo real
docker-compose logs -f backend

# Terminal 2: Ejecutar pruebas
bash test-api.sh

# En otra terminal: Acceso a DB
docker exec -it serplantas_db psql -U serplantas -d serplantas_db
```

---

### P: Cambié `.env` pero no funciona

**R:** Necesitas reiniciar Docker:
```bash
docker-compose down
docker-compose up -d
```

---

## 📚 Más Información

- **NestJS:** https://docs.nestjs.com
- **TypeORM:** https://typeorm.io
- **Speakeasy:** https://github.com/speakeasyjs/speakeasy
- **JWT:** https://jwt.io
- **PostgreSQL:** https://www.postgresql.org/docs/

---

## ❓ ¿Tu pregunta no está aquí?

Abre un issue en GitHub o contacta al equipo de desarrollo.

---

**Última actualización:** Enero 2024
**Versión:** 1.0.0
