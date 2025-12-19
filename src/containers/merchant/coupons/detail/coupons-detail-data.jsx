// Dummy batch data can be dynamically fetched in a real app,
// but for now we export it as a function or object if it's mock data.
// Here we export a function that could potentially take an ID.

export const getBatchDetails = (id) => ({
    id,
    name: "Summer Special",
    discount: "20%",
    quantity: 500,
    used: 125,
    status: "active",
    created: "2024-06-01",
    validUntil: "2024-12-31",
});

export const serialCodes = [
    {
        code: "SUM-8X92",
        status: "used",
        customer: "John Doe",
        usedDate: "2024-06-02",
    },
    {
        code: "SUM-3A7B",
        status: "used",
        customer: "Jane Smith",
        usedDate: "2024-06-01",
    },
    { code: "SUM-2C4D", status: "unused", customer: "-", usedDate: "-" },
    { code: "SUM-9E1F", status: "unused", customer: "-", usedDate: "-" },
    { code: "SUM-5G6H", status: "unused", customer: "-", usedDate: "-" },
];
