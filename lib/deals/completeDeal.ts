import { prisma } from "@/lib/prisma";

type CompleteDealProps = {
  dealId: string;
  completedBy: string;
};

export async function completeDeal({
  dealId,
  completedBy,
}: CompleteDealProps) {
  return prisma.$transaction(async (tx) => {
    const deal = await tx.deal.findUnique({
      where: {
        id: dealId,
      },
    });

    if (!deal) {
      throw new Error("Deal not found.");
    }

    if (deal.status === "COMPLETED") {
      throw new Error("This deal has already been completed.");
    }

    if (!deal.sellerConfirmed || !deal.buyerConfirmed) {
      throw new Error(
        "Both buyer and seller must confirm the deal."
      );
    }

    const product = await tx.product.findUnique({
      where: {
        id: deal.productId,
      },
    });

    if (!product) {
      throw new Error("Product not found.");
    }

    if (product.status === "SOLD") {
      throw new Error("Product is already sold.");
    }

    const updatedProduct =
      await tx.product.update({
        where: {
          id: product.id,
        },
        data: {
          status: "SOLD",
          buyerId: deal.buyerId,
          finalPrice: deal.finalPrice,
          soldAt: new Date(),
        },
      });

    const completedDeal =
      await tx.deal.update({
        where: {
          id: deal.id,
        },
        data: {
          status: "COMPLETED",
          completedBy,
          confirmedAt: new Date(),
          completedAt: new Date(),
        },
      });

    await tx.conversation.updateMany({
      where: {
        productId: deal.productId,
      },
      data: {
        isArchived: true,
      },
    });

    await tx.notification.createMany({
      data: [
        {
          userId: deal.sellerId,
          title: "Deal Completed",
          message: `"${product.title}" has been marked as sold.`,
          type: "DEAL_COMPLETED",
          link: "/dashboard",
        },
        {
          userId: deal.buyerId,
          title: "Purchase Successful",
          message: `You purchased "${product.title}".`,
          type: "PURCHASE",
          link: "/dashboard",
        },
      ],
    });

    return {
      success: true,
      product: updatedProduct,
      deal: completedDeal,
    };
  });
}