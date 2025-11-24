import { CategoryType, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

describe("Transaction externalId idempotency", () => {
  const userEmail = "externalid-test@example.com";
  const otherUserEmail = "externalid-test-other@example.com";
  const externalId = "sub-billing-001";

  let userId: string;
  let categoryId: string;
  let otherUserId: string;
  let otherCategoryId: string;

  beforeAll(async () => {
    await prisma.transaction.deleteMany({ where: { externalId } });
    await prisma.user.deleteMany({
      where: { email: { in: [userEmail, otherUserEmail] } },
    });

    const user = await prisma.user.create({
      data: {
        email: userEmail,
        password: null,
        name: "ExternalId Tester",
      },
    });
    userId = user.id;

    const category = await prisma.category.create({
      data: {
        name: "Subscription",
        type: CategoryType.EXPENSE,
        userId,
      },
    });
    categoryId = category.id;

    const otherUser = await prisma.user.create({
      data: {
        email: otherUserEmail,
        password: null,
        name: "ExternalId Other",
      },
    });
    otherUserId = otherUser.id;

    const otherCategory = await prisma.category.create({
      data: {
        name: "Subscription Other",
        type: CategoryType.EXPENSE,
        userId: otherUserId,
      },
    });
    otherCategoryId = otherCategory.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: [userId, otherUserId].filter(Boolean) } },
    });
    await prisma.$disconnect();
  });

  it("rejects duplicate externalId for the same user", async () => {
    await prisma.transaction.create({
      data: {
        amount: 10000,
        date: new Date(),
        type: CategoryType.EXPENSE,
        categoryId,
        userId,
        externalId,
      },
    });

    await expect(
      prisma.transaction.create({
        data: {
          amount: 20000,
          date: new Date(),
          type: CategoryType.EXPENSE,
          categoryId,
          userId,
          externalId,
        },
      })
    ).rejects.toMatchObject<Partial<Prisma.PrismaClientKnownRequestError>>({
      code: "P2002",
      meta: expect.objectContaining({
        target: expect.arrayContaining(["userId", "externalId"]),
      }),
    });
  });

  it("allows same externalId for different users", async () => {
    const tx = await prisma.transaction.create({
      data: {
        amount: 15000,
        date: new Date(),
        type: CategoryType.EXPENSE,
        categoryId: otherCategoryId,
        userId: otherUserId,
        externalId,
      },
    });

    expect(tx.externalId).toBe(externalId);
    expect(tx.userId).toBe(otherUserId);
  });
});
