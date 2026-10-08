/** Rounds a monetary value to 2 decimals, hiding floating point noise from summed amounts. */
export const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
