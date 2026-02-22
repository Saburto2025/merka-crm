# Configuración de Vercel Postgres

## Pasos para configurar la base de datos:

### 1. Crear base de datos en Vercel
1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com)
2. Click en **Storage** → **Create Database**
3. Selecciona **Postgres**
4. Nombre: `crm-migrante`
5. Click en **Create**

### 2. Conectar la base de datos
1. En la base de datos creada, click en **Connect to Project**
2. Selecciona tu proyecto `merka-crm`
3. Vercel agregará automáticamente las variables de entorno

### 3. Crear la tabla
1. En el dashboard de la base de datos, click en **Query**
2. Ejecuta el contenido del archivo `sql/init.sql`:

```sql
CREATE TABLE IF NOT EXISTS public_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  company VARCHAR(255),
  message TEXT,
  source VARCHAR(50) DEFAULT 'formulario',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  imported BOOLEAN DEFAULT false,
  "importedAt" TIMESTAMP WITH TIME ZONE,
  "projectId" VARCHAR(255)
);
```

### 4. Variables de entorno necesarias
Vercel las configura automáticamente, pero si necesitas agregarlas manualmente:

```
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
```

### 5. Redesplegar
Después de crear la tabla, haz un nuevo despliegue:
- Ve a **Deployments** → Click en los 3 puntos del último deploy → **Redeploy**

## ¡Listo!
El formulario público ahora guardará los datos en Vercel Postgres.
