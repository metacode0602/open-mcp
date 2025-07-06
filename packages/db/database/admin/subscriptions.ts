import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { db } from "../../index";
import { emailSubscriptions } from "../../schema";
import { zCreateSubscriptionSchema, zUpdateSubscriptionSchema, zSearchSubscriptionsSchema } from "../../types/zod/subscriptions";
import { createId } from "@paralleldrive/cuid2";

export const emailSubscriptionDataAccess = {
  create: async (data: typeof zCreateSubscriptionSchema._type) => {
    const verificationToken = createId();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hour expiration

    const [result] = await db.insert(emailSubscriptions).values({
      ...data,
      id: createId(),
      isVerified: false,
      verificationToken,
      verificationExpires,
    }).onConflictDoUpdate({
      target: [emailSubscriptions.email],
      set: {
        ...data,
        updatedAt: new Date(),
        verificationToken,
        verificationExpires,
      },
      where: eq(emailSubscriptions.isVerified, false),
    }).returning();
    return result;
  },

  update: async (email: string, data: typeof zUpdateSubscriptionSchema._type) => {
    const [result] = await db
      .update(emailSubscriptions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(emailSubscriptions.email, email))
      .returning();
    return result;
  },

  verify: async (token: string) => {
    const now = new Date();
    const subscription = await db.query.emailSubscriptions.findFirst({
      where: and(
        eq(emailSubscriptions.verificationToken, token),
        sql`${emailSubscriptions.verificationExpires} > ${now}`
      ),
    });

    if (!subscription) {
      throw new Error("Invalid or expired verification token");
    }

    return db
      .update(emailSubscriptions)
      .set({
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
        updatedAt: now,
      })
      .where(eq(emailSubscriptions.id, subscription.id))
      .returning();
  },

  getByEmail: async (email: string) => {
    return db.query.emailSubscriptions.findFirst({
      where: eq(emailSubscriptions.email, email),
    });
  },

  search: async (params: typeof zSearchSubscriptionsSchema._type) => {
    const { query, page = 1, limit = 10, isVerified } = params;
    const offset = (page - 1) * limit;
    const conditions = [];

    if (query) {
      conditions.push(
        or(
          like(emailSubscriptions.email, `%${query}%`),
          like(emailSubscriptions.name || "", `%${query}%`)
        )
      );
    }

    if (typeof isVerified === "boolean") {
      conditions.push(eq(emailSubscriptions.isVerified, isVerified));
    }

    const results = await db.query.emailSubscriptions.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset,
      orderBy: [desc(emailSubscriptions.createdAt)],
    });

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailSubscriptions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = countResult[0]?.count ?? 0;

    return {
      data: results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  delete: async (email: string) => {
    return db.delete(emailSubscriptions)
      .where(eq(emailSubscriptions.email, email))
      .returning();
  },
};