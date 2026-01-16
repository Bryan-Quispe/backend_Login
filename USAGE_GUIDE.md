# 📚 Guía Detallada de Uso - SerPlantas Backend

## 🎯 Flujo de Autenticación Completo

### Paso 1: Registro de Usuario

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

**Respuesta esperada:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "jgonzález",
    "email": "juan@example.com",
    "firstName": "Juan"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Reglas de Username:**
- Se genera automáticamente con: `primerLetraNombre + Apellido`
- Ejemplo: Juan González → `jgonzález`
- Convertido a minúsculas

### Paso 2: Login Básico (sin 2FA)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jgonzález",
    "password": "Seguro123!"
  }'
```

**Respuesta (sin 2FA):**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "jgonzález",
    "email": "juan@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Token JWT:**
- Dura: 10 minutos
- Incluye: ID del usuario y username
- Método: Bearer token en header Authorization

### Paso 3: Configurar 2FA

#### 3.1 Obtener Código QR

```bash
curl -X GET http://localhost:3000/auth/2fa/setup \
  -H "Authorization: Bearer {accessToken}"
```

**Respuesta:**
```json
{
  "secret": "JBSWY3DPEBLW64TMMQ======",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH...",
  "message": "Escanea el código QR con Google Authenticator"
}
```

**Pasos:**
1. Abre Google Authenticator en tu teléfono
2. Toca el botón "+" para añadir una cuenta
3. Selecciona "Escanear un código QR"
4. Escanea el código QR recibido
5. Anotate el código secreto por si acaso

#### 3.2 Habilitar 2FA con Código

```bash
curl -X POST http://localhost:3000/auth/2fa/enable \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "123456"
  }'
```

**Respuesta:**
```json
{
  "message": "2FA habilitado exitosamente",
  "backupCodes": [
    "ABCD1234",
    "EFGH5678",
    "IJKL9012",
    "MNOP3456",
    "QRST7890",
    "UVWX1234",
    "XYZA5678",
    "BCDE9012",
    "FGHI3456",
    "JKLM7890"
  ],
  "warning": "Guarda estos códigos en un lugar seguro. Los necesitarás si pierdes acceso a tu autenticador."
}
```

⚠️ **IMPORTANTE:** Copia y guarda los códigos de respaldo en un lugar seguro.

### Paso 4: Login con 2FA Habilitado

#### 4.1 Primer paso - Login normal

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jgonzález",
    "password": "Seguro123!"
  }'
```

**Respuesta (con 2FA):**
```json
{
  "message": "Se requiere autenticación de doble factor",
  "accessToken": "token-temporal-5-minutos",
  "requiresTwoFactor": true
}
```

#### 4.2 Segundo paso - Validar 2FA

Toma el código de 6 dígitos de Google Authenticator y envíalo:

```bash
curl -X POST http://localhost:3000/auth/login-2fa \
  -H "Content-Type: application/json" \
  -d '{
    "token": "token-temporal-5-minutos",
    "code": "123456"
  }'
```

**Respuesta:**
```json
{
  "message": "Autenticación de doble factor exitosa",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "jgonzález",
    "email": "juan@example.com"
  }
}
```

### Paso 5: Usar el Token para Acciones Protegidas

#### Obtener Perfil

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer {accessToken}"
```

**Respuesta:**
```json
{
  "message": "Perfil obtenido exitosamente",
  "user": {
    "sub": "550e8400-e29b-41d4-a716-446655440000",
    "username": "jgonzález"
  }
}
```

#### Logout

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer {accessToken}"
```

**Respuesta:**
```json
{
  "message": "Logout exitoso"
}
```

---

## 🔐 Requisitos de Contraseña

Tu contraseña **DEBE** cumplir:

✅ Mínimo 8 caracteres
✅ Al menos una MAYÚSCULA (A-Z)
✅ Al menos una minúscula (a-z)
✅ Al menos un número (0-9) O un carácter especial (!@#$%^&*)

**Ejemplos válidos:**
- `Seguro123!`
- `MiPassword2024`
- `ABC@def123`
- `Test1Password`

**Ejemplos INVÁLIDOS:**
- `password` (sin mayúscula, número)
- `PASSWORD123` (sin minúscula)
- `Pass1` (muy corta)
- `abcdefgh` (sin mayúscula, número)

---

## 📱 Códigos de Respaldo para 2FA

Si pierdes acceso a Google Authenticator:

1. Usa uno de los códigos de respaldo en lugar del código 2FA
2. El código se eliminará automáticamente después de usarlo
3. Guarda los códigos en un lugar SEGURO (gestor de contraseñas, caja fuerte, etc.)

**Ejemplo:**
```bash
curl -X POST http://localhost:3000/auth/login-2fa \
  -H "Content-Type: application/json" \
  -d '{
    "token": "token-temporal",
    "code": "ABCD1234"
  }'
```

---

## 🚨 Códigos de Error Comunes

### 400 - Bad Request
- Usuario ya registrado
- Contraseña no válida
- Código 2FA inválido

### 401 - Unauthorized
- Credenciales inválidas
- Token expirado
- Token inválido

### 404 - Not Found
- Usuario no encontrado

---

## ⏱️ Expiración de Tokens

| Tipo de Token | Duración | Uso |
|---|---|---|
| Login Token | 10 minutos | Acceso a endpoints protegidos |
| Temp 2FA Token | 5 minutos | Validar 2FA después de login |

Después de expirados, debes hacer un nuevo login.

---

## 🔄 Flujo Completo en JavaScript/Fetch

```javascript
// 1. REGISTRO
async function register() {
  const res = await fetch('http://localhost:3000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: 'Juan',
      secondName: 'Carlos',
      lastName: 'González',
      secondLastName: 'Rodríguez',
      email: 'juan@example.com',
      password: 'Seguro123!'
    })
  });
  const data = await res.json();
  console.log('Usuario registrado:', data.user.username);
  return data.accessToken;
}

// 2. LOGIN
async function login() {
  const res = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'jgonzález',
      password: 'Seguro123!'
    })
  });
  const data = await res.json();
  
  if (data.requiresTwoFactor) {
    console.log('2FA requerido');
    return data.accessToken; // Token temporal
  }
  
  console.log('Login exitoso');
  return data.accessToken; // Token completo
}

// 3. OBTENER QR PARA 2FA
async function setup2FA(token) {
  const res = await fetch('http://localhost:3000/auth/2fa/setup', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  console.log('QR Code:', data.qrCode);
  return data.secret;
}

// 4. HABILITAR 2FA
async function enable2FA(token, code) {
  const res = await fetch('http://localhost:3000/auth/2fa/enable', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ code })
  });
  const data = await res.json();
  console.log('Códigos de respaldo:', data.backupCodes);
  return data.backupCodes;
}

// 5. LOGIN CON 2FA
async function loginWith2FA(tempToken, code) {
  const res = await fetch('http://localhost:3000/auth/login-2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: tempToken,
      code: code
    })
  });
  const data = await res.json();
  console.log('2FA validado');
  return data.accessToken; // Token completo
}

// 6. OBTENER PERFIL
async function getProfile(token) {
  const res = await fetch('http://localhost:3000/auth/profile', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  console.log('Perfil:', data.user);
}
```

---

## 📊 Estructura de Base de Datos

```sql
-- Tabla users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  firstName VARCHAR,
  secondName VARCHAR,
  lastName VARCHAR,
  secondLastName VARCHAR,
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR NOT NULL,
  password VARCHAR NOT NULL, -- Encriptada con bcrypt
  twoFactorEnabled BOOLEAN DEFAULT false,
  twoFactorSecret VARCHAR, -- Código secreto TOTP
  twoFactorBackupCodes TEXT, -- JSON array de códigos
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_email ON users(email);
```

---

## 💡 Mejores Prácticas

1. **Almacena el token seguro:** En localStorage, sessionStorage o cookie segura
2. **Maneja la expiración:** Implementa refresh tokens para sesiones largas
3. **Renueva el 2FA:** Cada 30 días (recomendado)
4. **Guarda los códigos de respaldo:** En un lugar seguro offline
5. **Usa HTTPS en producción:** Siempre
6. **No expongas el token:** En logs, mensajes de error, etc.

---

## 🐞 Debugging

### Ver logs de Docker

```bash
docker-compose logs -f backend
```

### Conectar a PostgreSQL

```bash
docker exec -it serplantas_db psql -U serplantas -d serplantas_db

-- Ver usuarios creados
SELECT id, username, email, "twoFactorEnabled" FROM users;
```

### Validar Token JWT

Usa https://jwt.io/ para decodificar y validar tokens

---

¡Listo para usar tu backend seguro! 🎉
