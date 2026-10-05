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

  if (!offerActive) {
    return {
      price: plan.price,
      originalPrice: plan.price,
      offerActive: false,
      discountPercent: 0,
      offerMessage: null,
      offerEndsAt: null,
    };
  }

  let effectivePrice = plan.price;

  if (plan.offerPrice !== null && plan.offerPrice !== undefined) {
    effectivePrice = Math.max(1, Math.floor(plan.offerPrice));
  } else if (
    plan.discountPercent !== null &&
    plan.discountPercent !== undefined
  ) {
    effectivePrice = Math.max(
      1,
      Math.round(plan.price * (1 - plan.discountPercent / 100))
    );
  }

  const actualDiscount =
    plan.price > 0
      ? Math.max(
          0,
          Math.round(((plan.price - effectivePrice) / plan.price) * 100)
        )
      : 0;

  return {
    price: effectivePrice,
    originalPrice: plan.price,
    offerActive: effectivePrice < plan.price,
    discountPercent: actualDiscount,
    offerMessage: plan.offerMessage,
    offerEndsAt: plan.offerEndsAt,
  };
}