import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// POST - Crear nuevo lead desde formulario público
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { firstName, lastName, email, phone, whatsapp, company, message, projectId } = body;

    // Validación básica
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'Nombre y apellido son requeridos' },
        { status: 400 }
      );
    }

    // Crear el lead público usando Vercel Postgres
    const result = await sql`
      INSERT INTO public_leads (id, "firstName", "lastName", email, phone, whatsapp, company, message, source, "createdAt", imported)
      VALUES (
        gen_random_uuid(),
        ${firstName},
        ${lastName},
        ${email || null},
        ${phone || null},
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
    const { searchParams } = new URL(request.url);
    const imported = searchParams.get('imported');
    
    let query;
    if (imported !== null) {
      query = sql`SELECT * FROM public_leads WHERE imported = ${imported === 'true'} ORDER BY "createdAt" DESC`;
    } else {
      query = sql`SELECT * FROM public_leads ORDER BY "createdAt" DESC`;
    }

    const result = await query;

    return NextResponse.json({ leads: result.rows });
  } catch (error) {
    console.error('Error fetching public leads:', error);
    return NextResponse.json(
      { error: 'Error al obtener leads' },
      { status: 500 }
    );
  }
}
