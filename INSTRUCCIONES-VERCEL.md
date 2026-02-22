# 🚀 Instrucciones para Configurar Vercel Postgres

## Paso 1: Crear base de datos en Vercel

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto **merka-crm**
3. Ve a la pestaña **Storage**
4. Haz clic en **Create Database**
5. Selecciona **Postgres**
6. Dale un nombre (ej: `merka-crm-db`)
7. Haz clic en **Create**

## Paso 2: Conectar la base de datos

1. En tu base de datos, ve a la pestaña **.env.local**
2. Copia todas las variables de entorno
3. Ve a tu proyecto en Vercel → **Settings** → **Environment Variables**
4. Pega las siguientes variables:

```
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
```

## Paso 3: Ejecutar migración

Después de conectar la base de datos, Vercel ejecutará automáticamente `prisma migrate deploy` durante el build.

## Paso 4: Redesplegar

1. Ve a la pestaña **Deployments**
2. Haz clic en los 3 puntos (...) del último deploy
3. Selecciona **Redeploy**

---

## 📋 Resumen de cambios:

- ✅ Formulario público: `/formulario`
- ✅ Botón "Formulario" en CRM para importar leads
- ✅ Flechas direccionales en cada lead
- ✅ Base de datos PostgreSQL para producción

## 🔗 URLs importantes:

- CRM: https://crm.migrantecr.org
- Formulario: https://crm.migrantecr.org/formulario
- GitHub: https://github.com/Saburto2025/merka-crm
