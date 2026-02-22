import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH - Marcar lead como importado
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const lead = await db.publicLead.update({
      where: { id },
      data: {
        imported: body.imported ?? true,
        importedAt: body.imported ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, lead });
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
    
    await db.publicLead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting public lead:', error);
    return NextResponse.json(
      { error: 'Error al eliminar lead' },
      { status: 500 }
    );
  }
}
