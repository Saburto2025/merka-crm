import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    // Crear el lead público
    const publicLead = await db.publicLead.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        company: company || null,
        message: message || null,
        source: 'formulario',
        projectId: projectId || null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Gracias por contactarnos. Te responderemos pronto.',
      leadId: publicLead.id 
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
    
    const where = imported !== null 
      ? { imported: imported === 'true' } 
      : {};

    const leads = await db.publicLead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Error fetching public leads:', error);
    return NextResponse.json(
      { error: 'Error al obtener leads' },
      { status: 500 }
    );
  }
}
