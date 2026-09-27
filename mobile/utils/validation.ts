export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function normalizeMobile(input: string): string {
  return input.replace(/[\s-]/g, '').replace(/^\+91/, '').replace(/^0/, '');
}

export function isValidIndianMobile(input: string): boolean {
  return /^[6-9]\d{9}$/.test(normalizeMobile(input));
}

export function validateWelcome(mobile: string, email: string): { mobile?: string; email?: string } {
  const errors: { mobile?: string; email?: string } = {};
  if (!mobile.trim()) errors.mobile = 'Mobile number is required';
  else if (!isValidIndianMobile(mobile)) errors.mobile = 'Enter a valid 10-digit Indian mobile number';
  if (!email.trim()) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email';
  return errors;
}

export function validateOnboarding(fullName: string, address: string): { fullName?: string; address?: string } {
  const errors: { fullName?: string; address?: string } = {};
  if (fullName.trim().length < 2) errors.fullName = 'Enter your full name to continue.';
  if (address.trim().length < 5) errors.address = 'Enter your address & area';
  return errors;
}
