import { NextResponse } from 'next/server';

export async function GET() {
  // Apenas retorna um status OK e a hora atual
  return NextResponse.json({ 
    status: 'alive', 
    timestamp: new Date().toISOString() 
  });
}