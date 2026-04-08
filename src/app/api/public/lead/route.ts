import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, whatsapp, company, message, businessId } = body;

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const { sql } = await import('@vercel/postgres');

    // Insertamos el lead. Nota que usamos businessId (el que viene del formulario)
    await sql`
      INSERT INTO public_leads ("firstName", "lastName", email, whatsapp, company, message, "business_id", source, imported)
      VALUES (
        ${firstName},
        ${lastName},
        ${email || ''},
        ${whatsapp || ''},
        ${company || ''},
        ${message || ''},
        ${businessId || 'general'},
        'formulario',
        false
      )
    `;

    return NextResponse.json({ success: true, message: 'Enviado con éxito' });
  } catch (error) {
    console.error('Error al guardar:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const b = searchParams.get('b') || 'general';

    const { sql } = await import('@vercel/postgres');
    
    // Buscamos solo los que coincidan con el negocio
    const result = await sql`
      SELECT * FROM public_leads 
      WHERE "business_id" = ${b} 
      AND imported = false 
      ORDER BY "createdAt" DESC
    `;

    return NextResponse.json({ leads: result.rows });
  } catch (error) {
    return NextResponse.json({ leads: [], error: 'Error al leer' });
  }
}
