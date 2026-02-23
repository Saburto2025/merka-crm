import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@vercel/postgres';

function getClient() {
  return createClient({
    connectionString: process.env.merka_crm_db_POSTGRES_URL || process.env.POSTGRES_URL,
  });
}

// PATCH - Marcar lead como importado
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = getClient();
  
  try {
    await client.connect();
    
    const { id } = await params;
    const body = await request.json();
    
    const result = await client.sql`
      UPDATE public_leads 
      SET imported = ${body.imported ?? true},
          "importedAt" = ${body.imported ? new Date().toISOString() : null}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lead no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, lead: result.rows[0] });
  } catch (error: unknown) {
    console.error('Error updating public lead:', error);
    return NextResponse.json(
      { error: 'Error al actualizar lead' },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}

// DELETE - Eliminar lead público
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = getClient();
  
  try {
    await client.connect();
    
    const { id } = await params;
    
    const result = await client.sql`
      DELETE FROM public_leads WHERE id = ${id}
      RETURNING id
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lead no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting public lead:', error);
    return NextResponse.json(
      { error: 'Error al eliminar lead' },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
