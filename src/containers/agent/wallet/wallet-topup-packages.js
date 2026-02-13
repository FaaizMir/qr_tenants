// Wallet Top-Up Packages Configuration
// Agents can purchase prepaid balance for platform operations

export const walletTopUpPackages = [
  {
    id: 'topup_500',
    name: 'Starter Top-Up',
    amount: 500,
    currency: 'RM',
    description: 'Perfect for getting started with a few merchants',
    popular: false,
    bonus: 0,
    features: [
      'Covers ~1-2 annual merchants',
      'Or ~4000 WhatsApp UI messages',
      'Or ~1000 WhatsApp BI messages',
    ],
  },
  {
    id: 'topup_1000',
    name: 'Standard Top-Up',
    amount: 1000,
    currency: 'RM',
    description: 'Best for small to medium operations',
    popular: true,
    bonus: 50, // Bonus RM50
    features: [
      'Covers ~3-4 annual merchants',
      'Or ~8000 WhatsApp UI messages',
      'Or ~2000 WhatsApp BI messages',
      '✨ Bonus RM50 included',
    ],
  },
  {
    id: 'topup_2500',
    name: 'Business Top-Up',
    amount: 2500,
    currency: 'RM',
    description: 'Ideal for growing agencies',
    popular: false,
    bonus: 150, // Bonus RM150
    features: [
      'Covers ~8-10 annual merchants',
      'Or ~20,000 WhatsApp UI messages',
      'Or ~5,000 WhatsApp BI messages',
      '✨ Bonus RM150 included',
    ],
  },
  {
    id: 'topup_5000',
    name: 'Enterprise Top-Up',
    amount: 5000,
    currency: 'RM',
    description: 'For large-scale operations',
    popular: false,
    bonus: 500, // Bonus RM500
    features: [
      'Covers ~17-20 annual merchants',
      'Or ~40,000 WhatsApp UI messages',
      'Or ~10,000 WhatsApp BI messages',
      '✨ Bonus RM500 included',
    ],
  },
  {
    id: 'topup_10000',
    name: 'Premium Top-Up',
    amount: 10000,
    currency: 'RM',
    description: 'Maximum value for high-volume agencies',
    popular: false,
    bonus: 1500, // Bonus RM1500
    features: [
      'Covers ~38-40 annual merchants',
      'Or ~80,000 WhatsApp UI messages',
      'Or ~20,000 WhatsApp BI messages',
      '✨ Bonus RM1,500 included',
    ],
  },
];

// Calculate total amount including bonus
export const calculateTotalAmount = (baseAmount, bonus = 0) => {
  return baseAmount + bonus;
};

// Get recommended package based on current balance and typical usage
export const getRecommendedTopUp = (currentBalance) => {
  if (currentBalance < 300) return walletTopUpPackages[1]; // Standard
  if (currentBalance < 1000) return walletTopUpPackages[0]; // Starter
  if (currentBalance < 2000) return walletTopUpPackages[1]; // Standard
  return walletTopUpPackages[2]; // Business
};
