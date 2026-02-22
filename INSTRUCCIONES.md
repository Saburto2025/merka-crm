# 📖 INSTRUCCIONES - Merka 4.0 CRM

## 🎯 ¿Qué es este CRM?

Merka 4.0 es un sistema de gestión de leads y ventas que funciona **100% en tu PC**, sin necesidad de internet ni servidores externos. Todos tus datos se guardan localmente.

---

## 📋 REQUISITOS PREVIOS

### Paso 1: Instalar Node.js

1. Ve a: https://nodejs.org/
2. Descarga la versión **LTS** (recomendada para la mayoría)
3. Ejecuta el instalador y sigue los pasos (Next, Next, Finish)
4. Para verificar que se instaló correctamente:
   - Abre **Símbolo del sistema** (CMD) o **PowerShell**
   - Escribe: `node --version`
   - Debería mostrar algo como: `v20.x.x`

---

## 🚀 PRIMERA VEZ - Instalación

### Paso 1: Descomprimir
Descomprime esta carpeta en una ubicación fácil de encontrar, por ejemplo:
- `C:\MerkaCRM`
- `D:\Mis Programas\MerkaCRM`

### Paso 2: Abrir la terminal en la carpeta
**En Windows:**
- Abre la carpeta en el Explorador de archivos
- Escribe `cmd` en la barra de direcciones y presiona Enter
- O: Click derecho en la carpeta → "Abrir en Terminal"

### Paso 3: Instalar dependencias
Copia y pega este comando en la terminal:
```bash
npm install
```
Espera a que termine (puede tardar 1-2 minutos)

### Paso 4: Configurar la base de datos
```bash
npx prisma db push
```

### Paso 5: ¡Listo! Iniciar el CRM
```bash
npm run dev
```

### Paso 6: Abrir en el navegador
Abre Chrome, Firefox o Edge y ve a:
```
http://localhost:3000
```

---

## 🌅 USO DIARIO

### Cada mañana para abrir el CRM:

1. Abre la terminal (CMD)
2. Navega a la carpeta:
   ```bash
   cd C:\MerkaCRM
   ```
3. Inicia el servidor:
   ```bash
   npm run dev
   ```
4. Abre el navegador en: http://localhost:3000

### Al terminar el día:

1. Cierra el navegador
2. En la terminal, presiona `Ctrl + C` para detener el servidor
3. ¡Listo! Tus datos quedan guardados automáticamente

---

## 💾 SEGURIDAD DE LOS DATOS

### ✅ Los datos se guardan automáticamente
Tu información se almacena en un archivo de base de datos local:
```
C:\MerkaCRM\db\custom.db
```

**Esto significa:**
- ✅ Los datos persisten al cerrar el navegador
- ✅ Los datos persisten al apagar la PC
- ✅ Todo está en tu PC, no en la nube
- ✅ Sin necesidad de internet

### 📦 RESPALDOS RECOMENDADOS

**Opción 1: Copiar el archivo de base de datos**
- Copia el archivo `db\custom.db` a un USB o carpeta de respaldo
- Si algo falla, solo pégalo de vuelta

**Opción 2: Exportar CSV desde el CRM**
- En el CRM, haz clic en **"Exportar CSV"**
- Guarda el archivo en una carpeta segura
- Puedes abrirlo en Excel

---

## ⚡ ACCESO RÁPIDO (Opcional)

Para no escribir comandos cada día, crea un acceso directo:

1. Crea un archivo nuevo en el Escritorio llamado `Iniciar Merka CRM.bat`
2. Edita el archivo con el Bloc de notas y pega esto:
```batch
@echo off
title Merka 4.0 CRM
cd C:\MerkaCRM
echo ========================================
echo   Iniciando Merka 4.0 CRM...
echo   Espera un momento...
echo ========================================
echo.
npm run dev
pause
```
3. Guarda el archivo
4. Doble clic en el archivo para iniciar el CRM

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### El comando `node` no se reconoce
- Cierra y vuelve a abrir la terminal
- Si persiste, reinicia la PC después de instalar Node.js

### Error de puerto ocupado
Si aparece un error de que el puerto 3000 está ocupado:
```bash
# En Windows, mata el proceso que usa el puerto:
netstat -ano | findstr :3000
taskkill /PID [número que aparece] /F
```

### La base de datos está dañada
- Copia tu respaldo de `custom.db` a la carpeta `db`
- O elimina el archivo `db\custom.db` y ejecuta: `npx prisma db push`

### Error al instalar dependencias
```bash
# Limpia la caché y reinstala:
rm -rf node_modules
npm cache clean --force
npm install
```

---

## 📱 FUNCIONALIDADES DEL CRM

### Pipeline de Ventas (Kanban)
Arrastra los leads entre las 11 etapas:
1. Prospecto
2. Lead
3. Prospecto Calificado
4. Perspectiva Calificada
5. Oferta Inicial Presentada
6. Patrocinador Calificado
7. Patrocinador con Poder
8. Negociación Acordada
9. En Espera de Formalización
10. Contrato
11. Perdida

### Gestión Multi-Proyecto
- Crea diferentes proyectos/empresas
- Los leads están aislados por proyecto

### Lógica de Pérdida
Al mover un lead a "Perdida", debes seleccionar la razón:
- Precio
- Falta de Calidad
- Falta de Seguimiento
- No Aplicamos

### Campos Personalizados
- Añade campos extra según tus necesidades
- Por proyecto, diferentes campos

### Importar/Exportar
- Exporta todo a CSV (compatible con Excel)
- Importa leads desde archivos CSV

---

## 📞 SOPORTE

WhatsApp de contacto: +506 6449 8045
Enlace directo: https://wa.me/50664498045

---

## ❓ PREGUNTAS FRECUENTES

| Pregunta | Respuesta |
|----------|-----------|
| ¿Necesito internet? | No, funciona 100% offline |
| ¿Se pierden datos al cerrar? | No, todo se guarda automáticamente |
| ¿Puedo usarlo en varios equipos? | Sí, copiando toda la carpeta |
| ¿Dónde están mis datos? | En el archivo `db\custom.db` |
| ¿Puedo compartirlo? | Sí, copia toda la carpeta a otra PC |

---

**¡Disfruta tu CRM!** 🎉
