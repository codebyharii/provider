import { Prisma } from '@prisma/client';

export type ProviderWithAssignments = Prisma.ProviderGetPayload<{
  include: {
    assignments: {
      include: {
        lead: {
          include: {
            service: true;
          };
        };
      };
    };
  };
}>;

export interface LeadSubmissionPayload {
  name: string;
  phone: string;
  city: string;
  description: string;
  serviceId: number;
}
