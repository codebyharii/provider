import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { allocateLead } from '@/lib/allocation';
import { sseManager } from '@/lib/sse';
import { leadSchema } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = leadSchema.safeParse(body);

    if (!result.success) {
      const errorMessage = result.error.issues.map(issue => issue.message).join(', ');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const data = result.data;

    // Check for DB-level duplicate guard logic via Prisma unique constraint
    // But we can also manually check first for better error messages
    const existingLead = await prisma.lead.findFirst({
      where: {
        phone: data.phone,
        serviceId: data.serviceId,
      }
    });

    if (existingLead) {
      return NextResponse.json({ error: "Duplicate lead for this service" }, { status: 409 });
    }

    // Create the lead
    const newLead = await prisma.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        city: data.city,
        description: data.description,
        serviceId: data.serviceId,
      }
    });

    // Run fair allocation
    const assignedProviders = await allocateLead(newLead.id, data.serviceId);

    // Broadcast update via SSE
    sseManager.broadcast({
      type: 'NEW_LEAD',
      leadId: newLead.id,
      assignedProviders
    });

    return NextResponse.json({
      success: true,
      leadId: newLead.id,
      assignedProviders
    }, { status: 201 });

  } catch (error) {
    console.error("Lead submission error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
