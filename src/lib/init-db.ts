import { sql } from '@vercel/postgres';

// Crear tabla de leads públicos si no existe
export async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS public_leads (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
        "firstName" VARCHAR(255) NOT NULL,
        "lastName" VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        whatsapp VARCHAR(255),
        company VARCHAR(255),
        message TEXT,
        source VARCHAR(50) DEFAULT 'formulario',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        imported BOOLEAN DEFAULT false,
        "importedAt" TIMESTAMP WITH TIME ZONE,
        "projectId" VARCHAR(255)
      );
    `;
    console.log('Tabla public_leads creada o ya existe');
    return true;
  } catch (error) {
    console.error('Error creando tabla:', error);
    return false;
  }
}

// Inicializar al importar
initDatabase();
