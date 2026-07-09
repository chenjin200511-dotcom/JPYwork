// Purpose: Records user-visible workspace activity timeline entries.
import { prisma } from "@/lib/db/prisma";

export async function writeActivity(input: {
  action: string;
  content: string;
  entityId: string;
  entityType: string;
  userId?: string | null;
}) {
  return prisma.activity.create({
    data: {
      action: input.action,
      content: input.content,
      entityId: input.entityId,
      entityType: input.entityType,
      userId: input.userId ?? null,
    },
  });
}
