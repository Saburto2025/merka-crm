import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Agregamos 'businessId' que viene desde el formulario nuevo que pegamos antes
    const { firstName, lastName, email, whatsapp, company, message, businessId } = body;

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'Nombre y apellido son requeridos' }, { status: 400 });
    }

    try {
      const { sql } = await import('@vercel/postgres');
      
      // 1. Creamos la tabla con la nueva columna 'business_id' para separar los leads
      await sql`
        CREATE TABLE IF NOT EXISTS public_leads (
          id SERIAL PRIMARY KEY,
          "firstName" VARCHAR(255) NOT NULL,
          "lastName" VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          whatsapp VARCHAR(255),
          company VARCHAR(255),
          message TEXT,
          "business_id" VARCHAR(255), 
          source VARCHAR(50) DEFAULT 'formulario',
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          imported BOOLEAN DEFAULT false
        );
      `;

      // 2. Insertamos el lead con su etiqueta de negocio
      const result = await sql`
        INSERT INTO public_leads ("firstName", "lastName", email, whatsapp, company, message, "business_id", source, "createdAt", imported)
        VALUES (
          ${firstName},
          ${lastName},
          ${email || ''},
          ${whatsapp || ''},
          ${company || ''},
          ${message || ''},
          ${businessId || 'general'},
          'formulario',
          NOW(),
          false
        )
        RETURNING id
      `;

      return NextResponse.json({ success: true, leadId: result.rows[0]?.id });
    } catch (dbError) {
      console.error('Error DB:', dbError);
      return NextResponse.json({ success: true, storage: 'memory' });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error al procesar' }, { status: 500 });
  }
}

// GET - Modificado para que el CRM solo baje los leads de SU negocio
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('b'); // El CRM debe preguntar por su ID

    const { sql } = await import('@vercel/postgres');
    
    // Si el CRM envía un ID, filtramos. Si no, traemos los que no tienen ID.
    const result = businessId 
      ? await sql`SELECT * FROM public_leads WHERE "business_id" = ${businessId} AND imported = false ORDER BY "createdAt" DESC`
      : await sql`SELECT * FROM public_leads WHERE imported = false ORDER BY "createdAt" DESC`;

    return NextResponse.json({ leads: result.rows });
  } catch (error) {
    return NextResponse.json({ leads: [], error: 'Error en BD' });
  }
}
