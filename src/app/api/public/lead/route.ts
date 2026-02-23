import { NextRequest, NextResponse } from 'next/server';

// Usar fetch directo a Vercel Postgres REST API
async function query(sqlQuery: string, params: unknown[] = []) {
  const databaseUrl = process.env.POSTGRES_URL;
  
  if (!databaseUrl) {
    throw new Error('POSTGRES_URL no está configurada');
  }

  // Usar sql de @vercel/postgres si está disponible
  const { sql } = await import('@vercel/postgres');
  return await sql.query(sqlQuery, params);
}

// POST - Crear nuevo lead desde formulario público
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, whatsapp, company, message } = body;

    // Validación básica
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'Nombre y apellido son requeridos' },
        { status: 400 }
      );
    }

    // Importar sql dinámicamente
    const { sql } = await import('@vercel/postgres');

    // Crear tabla si no existe
    await sql`
      CREATE TABLE IF NOT EXISTS public_leads (
        id SERIAL PRIMARY KEY,
        "firstName" VARCHAR(255) NOT NULL,
        "lastName" VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        whatsapp VARCHAR(255),
        company VARCHAR(255),
        message TEXT,
        source VARCHAR(50) DEFAULT 'formulario',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        imported BOOLEAN DEFAULT false,
        "importedAt" TIMESTAMP WITH TIME ZONE
      );
    `;

    // Insertar el lead
    const result = await sql`
      INSERT INTO public_leads ("firstName", "lastName", email, whatsapp, company, message, source, "createdAt", imported)
      VALUES (
        ${firstName},
        ${lastName},
        ${email || ''},
        ${whatsapp || ''},
        ${company || ''},
        ${message || ''},
        'formulario',
        NOW(),
        false
      )
      RETURNING id
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Gracias por contactarnos. Te responderemos pronto.',
      leadId: result.rows[0]?.id 
    });
  } catch (error: unknown) {
    console.error('Error creating public lead:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: `Error: ${errorMessage}. Verifica la configuración de la base de datos.` },
      { status: 500 }
    );
  }
}

// GET - Obtener leads públicos (para el CRM)
export async function GET() {
  try {
    const { sql } = await import('@vercel/postgres');
    
    const result = await sql`
      SELECT * FROM public_leads 
      WHERE imported = false 
      ORDER BY "createdAt" DESC
    `;

    return NextResponse.json({ leads: result.rows });
  } catch (error: unknown) {
    console.error('Error fetching public leads:', error);
    return NextResponse.json(
      { error: 'Error al obtener leads' },
      { status: 500 }
    );
  }
}
