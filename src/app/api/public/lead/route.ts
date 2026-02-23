import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Función para crear la tabla si no existe
async function ensureTable() {
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
  } catch (error) {
    console.error('Error ensuring table exists:', error);
  }
}

// POST - Crear nuevo lead desde formulario público
export async function POST(request: NextRequest) {
  try {
    // Asegurar que la tabla existe
    await ensureTable();
    
    const body = await request.json();
    
    const { firstName, lastName, email, whatsapp, company, message } = body;

    // Validación básica
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'Nombre y apellido son requeridos' },
        { status: 400 }
      );
    }

    // Crear el lead público usando Vercel Postgres
    const result = await sql`
      INSERT INTO public_leads ("firstName", "lastName", email, whatsapp, company, message, source, "createdAt", imported)
      VALUES (
        ${firstName},
        ${lastName},
        ${email || null},
        ${whatsapp || null},
        ${company || null},
        ${message || null},
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
  } catch (error) {
    console.error('Error creating public lead:', error);
    return NextResponse.json(
      { error: 'Error al enviar el formulario. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}

// GET - Obtener leads públicos (para el CRM)
export async function GET(request: NextRequest) {
  try {
    // Asegurar que la tabla existe
    await ensureTable();
    
    const { searchParams } = new URL(request.url);
    const imported = searchParams.get('imported');
    
    let result;
    if (imported !== null) {
      result = await sql`SELECT * FROM public_leads WHERE imported = ${imported === 'true'} ORDER BY "createdAt" DESC`;
    } else {
      result = await sql`SELECT * FROM public_leads ORDER BY "createdAt" DESC`;
    }

    return NextResponse.json({ leads: result.rows });
  } catch (error) {
    console.error('Error fetching public leads:', error);
    return NextResponse.json(
      { error: 'Error al obtener leads' },
      { status: 500 }
    );
  }
}
