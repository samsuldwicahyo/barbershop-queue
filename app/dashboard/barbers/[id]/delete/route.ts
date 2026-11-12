import { NextRequest, NextResponse } from 'next/server';
import { deleteBarber } from '../../actions';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteBarber(id);
    return NextResponse.redirect(new URL('/dashboard/barbers', request.url));
  } catch (error) {
    console.error('Delete barber error:', error);
    return NextResponse.json({ error: 'Failed to delete barber' }, { status: 500 });
  }
}