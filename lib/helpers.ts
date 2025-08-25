export const confirmPasswordCharacters = (chars: string) => {
  const minLength = /^.{8,}$/;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-\\[\]\/]/;
  const fullValidation = /^(?=.*[!@#$%^&*(),.?":{}|<>_\-\\[\]\/]).{8,}$/;

  if (chars.length < 3) {
    // Don't check yet — return neutral state
    return {
      length: false,
      specialChar: false,
      validate: false,
      skip: true, // optional flag you can use in the UI
    };
  }

  return {
    length: minLength.test(chars),
    specialChar: hasSpecialChar.test(chars),
    validate: fullValidation.test(chars),
    skip: false,
  };
};

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}
