# 🚀 Guía de Deployment - SerPlantas Backend

## Requisitos Previos

- Docker y Docker Compose instalados
- Un servidor (AWS EC2, DigitalOcean, Linode, etc.)
- Dominio configurado
- SSL/TLS certificado (Let's Encrypt recomendado)

---

## Opción 1: Deployment en DigitalOcean App Platform

### 1. Preparar el Repositorio

```bash
git init
git add .
git commit -m "Initial commit: SerPlantas Backend"
git push origin main
```

### 2. Conectar a DigitalOcean

1. Ve a https://cloud.digitalocean.com/apps
2. Selecciona "Create App"
3. Conecta tu repositorio GitHub
4. Selecciona la rama `main`

### 3. Configurar la Aplicación

- **Source:** GitHub repository
- **Build command:** `npm install && npm run build`
- **Run command:** `node dist/main`
- **HTTP port:** 3000

### 4. Configurar Variables de Entorno

En DigitalOcean App Platform:

```
DB_HOST=<database-host>
DB_PORT=5432
DB_USER=serplantas
DB_PASSWORD=<super-secure-password>
DB_NAME=serplantas_db
JWT_SECRET=<generate-with-openssl>
NODE_ENV=production
FRONTEND_URL=https://tu-dominio.com
```

### 5. Agregar PostgreSQL Database

1. En la sección "Components", agregar "Database"
2. Seleccionar PostgreSQL 14+
3. Nombrar: `serplantas-db`

---

## Opción 2: Deployment Tradicional (VPS/EC2)

### 1. Conectar por SSH

```bash
ssh ubuntu@tu-ip-del-servidor
```

### 2. Instalar Dependencias

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Agregar tu usuario al grupo docker (opcional)
sudo usermod -aG docker $USER
```

### 3. Clonar el Repositorio

```bash
cd /home/ubuntu
git clone https://github.com/tu-usuario/serplantas-backend.git
cd serplantas-backend
```

### 4. Configurar Variables de Entorno

```bash
cp .env.production .env
nano .env

# Edita los valores:
# - DB_PASSWORD
# - JWT_SECRET (generar con: openssl rand -base64 32)
# - FRONTEND_URL
```

### 5. Configurar Nginx como Reverse Proxy

```bash
# Instalar Nginx
sudo apt install nginx -y

# Crear configuración
sudo nano /etc/nginx/sites-available/default
```

**Contenido de configuración:**

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Redirigir HTTP a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    # Certificados SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    # Configuración SSL segura
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Headers de seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy al backend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Compresión
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
}
```

### 6. Configurar SSL/TLS con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generar certificado
sudo certbot certonly --nginx -d tu-dominio.com

# Auto-renovación
sudo systemctl enable certbot.timer
```

### 7. Iniciar Docker Compose

```bash
# Actualizar docker-compose.yml para producción
nano docker-compose.yml

# Cambiar:
# command: npm run start:dev  →  npm run start

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 8. Configurar Nginx y Reiniciar

```bash
# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver estado
sudo systemctl status nginx
```

---

## Opción 3: AWS Elastic Container Service (ECS)

### 1. Crear ECR Repository

```bash
aws ecr create-repository --repository-name serplantas-backend --region us-east-1
```

### 2. Build y Push de Imagen Docker

```bash
# Login a ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Build
docker build -t serplantas-backend .

# Tag
docker tag serplantas-backend:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/serplantas-backend:latest

# Push
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/serplantas-backend:latest
```

### 3. Crear ECS Cluster

```bash
aws ecs create-cluster --cluster-name serplantas-prod
```

### 4. Crear RDS PostgreSQL

```bash
aws rds create-db-instance \
  --db-instance-identifier serplantas-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username serplantas \
  --master-user-password <SUPER_SECURE_PASSWORD> \
  --allocated-storage 20 \
  --storage-type gp2
```

### 5. Crear Task Definition

Ver documentación de ECS: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/

---

## Monitoreo en Producción

### Configurar Logs

```bash
# Ver logs en tiempo real
docker-compose logs -f backend

# Guardar logs
docker logs serplantas_backend > backend.log 2>&1
```

### Health Check

```bash
# Endpoint de salud (crear en la app)
curl http://localhost:3000/health

# Automated checks
docker-compose ps
```

### Backup de Base de Datos

```bash
#!/bin/bash
# backup-db.sh

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

docker exec serplantas_db pg_dump -U serplantas serplantas_db > $BACKUP_DIR/backup_$TIMESTAMP.sql

# Comprimir
gzip $BACKUP_DIR/backup_$TIMESTAMP.sql

# Mantener solo los últimos 7 días
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completado: $BACKUP_DIR/backup_$TIMESTAMP.sql.gz"
```

```bash
# Agendar con cron (cada día a las 2 AM)
crontab -e
# 0 2 * * * /home/ubuntu/serplantas-backend/backup-db.sh
```

---

## Checklist Pre-Producción

- [ ] JWT_SECRET generado y seguro
- [ ] DB_PASSWORD actualizada
- [ ] FRONTEND_URL configurada correctamente
- [ ] SSL/TLS certificado instalado
- [ ] CORS configurado para dominio específico
- [ ] Nginx con headers de seguridad
- [ ] Backups automáticos configurados
- [ ] Monitoreo y alertas
- [ ] Logs centralizados
- [ ] Rate limiting habilitado
- [ ] CORS habilitado solo para frontal
- [ ] Documentación actualizada
- [ ] Pruebas de carga realizadas

---

## Monitoreo Continuo

### Health Check Endpoint (Agregar a main.ts)

```typescript
@Controller('health')
export class HealthController {
  @Get()
  health() {
    return { status: 'ok', timestamp: new Date() };
  }
}
```

### Dockerfile Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

---

## Troubleshooting Producción

### Error: "Connection refused"
```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps
docker-compose logs postgres
```

### Error: "Token invalid"
```bash
# Asegurar que JWT_SECRET es el mismo en todos los servidores
echo $JWT_SECRET
```

### Alto uso de CPU
```bash
# Monitorear procesos
docker stats
```

---

## Recursos Útiles

- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PostgreSQL Backup](https://www.postgresql.org/docs/current/backup.html)
- [Nginx Security](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

¡Tu aplicación está lista para producción! 🎉
