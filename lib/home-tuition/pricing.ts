
export type HomeTuitionPlanPricing = {
  price: number;
  offerEnabled: boolean;
  discountPercent: number | null;
  offerPrice: number | null;
  offerStartsAt: Date | null;
  offerEndsAt: Date | null;
  offerMessage: string | null;
};

export function getEffectivePlanPrice(
  plan: HomeTuitionPlanPricing,
  now = new Date()
) {
  const offerActive =
    plan.offerEnabled &&
    (!plan.offerStartsAt || plan.offerStartsAt <= now) &&
    (!plan.offerEndsAt || plan.offerEndsAt >= now);

  let effectivePrice = plan.price;

  if (offerActive) {
    if (plan.offerPrice != null) {
      effectivePrice = Math.max(1, Math.floor(plan.offerPrice));
    } else if (plan.discountPercent != null) {
      effectivePrice = Math.max(
        1,
        Math.round(
          plan.price * (1 - plan.discountPercent / 100)
        )
      );
    }
  }

  const actualDiscount =
    plan.price > 0 && effectivePrice < plan.price
      ? Math.round(
          ((plan.price - effectivePrice) / plan.price) * 100
        )
      : 0;

  const hasActiveDiscount =
    offerActive && effectivePrice < plan.price;

  return {
    price: plan.price,
    effectivePrice,
    originalPrice: plan.price,
    offerActive: hasActiveDiscount,
    discountPercent: actualDiscount,
    offerMessage: hasActiveDiscount ? plan.offerMessage : null,
    offerEndsAt: hasActiveDiscount ? plan.offerEndsAt : null,
  };
}
