import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// PATCH - Marcar lead como importado
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const imported = body.imported ?? true;

    await sql`
      UPDATE public_leads 
      SET imported = ${imported}, "importedAt" = ${imported ? new Date().toISOString() : null}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating public lead:', error);
    return NextResponse.json(
      { error: 'Error al actualizar lead' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar lead público
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await sql`DELETE FROM public_leads WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting public lead:', error);
    return NextResponse.json(
      { error: 'Error al eliminar lead' },
      { status: 500 }
    );
  }
}
