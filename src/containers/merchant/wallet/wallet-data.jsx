export const transactions = [
    {
        id: 1,
        date: "2024-06-01",
        description: "Purchased 1000 Credits",
        amount: 1000,
        type: "credit",
        status: "paid",
    },
    {
        id: 2,
        date: "2024-05-28",
        description: "WhatsApp Campaign (50 msg)",
        amount: -50,
        type: "debit",
        status: "completed",
    },
    {
        id: 3,
        date: "2024-05-25",
        description: "Generated Batch 'Summer Special'",
        amount: -100,
        type: "debit",
        status: "completed",
    },
    {
        id: 4,
        date: "2024-05-20",
        description: "Purchased 500 Credits",
        amount: 500,
        type: "credit",
        status: "paid",
    },
];

export const creditPackages = [
    { credits: 500, price: "$10", popular: false },
    { credits: 1500, price: "$25", popular: true },
    { credits: 5000, price: "$75", popular: false },
];
