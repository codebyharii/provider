import { prisma } from './prisma';

// Hard-coded rules per service (Provider IDs)
const MANDATORY_RULES: Record<number, number[]> = {
  1: [1],          // Service 1 -> Provider 1
  2: [5],          // Service 2 -> Provider 5
  3: [1, 4],       // Service 3 -> Provider 1, 4
};

const FAIR_POOLS: Record<number, number[]> = {
  1: [2, 3, 4],       // Service 1
  2: [6, 7, 8],       // Service 2
  3: [2, 3, 5, 6, 7, 8], // Service 3
};

const PROVIDERS_PER_LEAD = 3;

export async function allocateLead(leadId: number, serviceId: number) {
  // Use a transaction for concurrency safety
  return await prisma.$transaction(async (tx) => {
    // 1. Lock the allocation state for this service
    // This prevents race conditions when concurrent requests hit the same service
    const state = await tx.$queryRaw<{ id: number; nextIndex: number }[]>`
      SELECT id, "nextIndex" FROM "AllocationState" 
      WHERE "serviceId" = ${serviceId} 
      FOR UPDATE
    `;

    if (state.length === 0) {
      throw new Error(`Allocation state not found for service ${serviceId}`);
    }

    let nextIndex = state[0].nextIndex;

    // Load mandatory providers for this service
    const mandatoryProviderIds = MANDATORY_RULES[serviceId] || [];
    const poolProviderIds = FAIR_POOLS[serviceId] || [];

    // Fetch current state of relevant providers (mandatory + pool)
    const allRelevantIds = Array.from(new Set([...mandatoryProviderIds, ...poolProviderIds]));
    const providers = await tx.provider.findMany({
      where: { id: { in: allRelevantIds } },
    });

    const providerMap = new Map(providers.map(p => [p.id, p]));

    const selectedProviders: number[] = [];

    // 2. Select eligible mandatory providers
    for (const pid of mandatoryProviderIds) {
      const p = providerMap.get(pid);
      if (p && p.leadsReceived < p.monthlyQuota) {
        selectedProviders.push(pid);
      }
    }

    // 3. Calculate remaining slots needed
    const slotsNeeded = PROVIDERS_PER_LEAD - selectedProviders.length;

    // 4. Walk the fair pool round-robin if we need more slots
    if (slotsNeeded > 0 && poolProviderIds.length > 0) {
      let slotsFilled = 0;
      let attempts = 0;
      const maxAttempts = poolProviderIds.length; // Prevent infinite loops if all are full

      while (slotsFilled < slotsNeeded && attempts < maxAttempts) {
        const candidateId = poolProviderIds[nextIndex];
        const candidate = providerMap.get(candidateId);

        // Check if eligible
        if (
          candidate &&
          candidate.leadsReceived < candidate.monthlyQuota &&
          !selectedProviders.includes(candidateId)
        ) {
          selectedProviders.push(candidateId);
          slotsFilled++;
        }

        nextIndex = (nextIndex + 1) % poolProviderIds.length;
        attempts++;
      }
    }

    // 5. Save the updated nextIndex back to the database
    await tx.$executeRaw`
      UPDATE "AllocationState" 
      SET "nextIndex" = ${nextIndex}, "updatedAt" = NOW() 
      WHERE "serviceId" = ${serviceId}
    `;

    // 6. Assign the lead and update provider stats
    if (selectedProviders.length > 0) {
      await tx.leadAssignment.createMany({
        data: selectedProviders.map((pid) => ({
          leadId,
          providerId: pid,
        })),
      });

      await tx.provider.updateMany({
        where: { id: { in: selectedProviders } },
        data: {
          leadsReceived: { increment: 1 }
        }
      });
    }

    return selectedProviders;
  });
}
