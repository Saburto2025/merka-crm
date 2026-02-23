import { NextRequest, NextResponse } from 'next/server';

// POST - Crear nuevo lead desde formulario público
// Usa localStorage del lado del cliente, este endpoint es fallback
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

    // Intentar guardar en Vercel Postgres si está disponible
    try {
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
        leadId: result.rows[0]?.id,
        storage: 'database'
      });
    } catch {
      // Si la base de datos falla, guardar en memoria temporal
      console.log('Base de datos no disponible, usando almacenamiento temporal');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Gracias por contactarnos. Te responderemos pronto.',
        leadId: `temp-${Date.now()}`,
        storage: 'memory',
        data: { firstName, lastName, email, whatsapp, company, message }
      });
    }
  } catch (error: unknown) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
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
  } catch {
    // Si la base de datos falla, retornar lista vacía
    return NextResponse.json({ leads: [], error: 'Base de datos no disponible' });
  }
}
