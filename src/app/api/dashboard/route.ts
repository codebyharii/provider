import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      include: {
        assignments: {
          include: {
            lead: {
              include: {
                service: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    return NextResponse.json(providers);
  } catch (error: any) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
