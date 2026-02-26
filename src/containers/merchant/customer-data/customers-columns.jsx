import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { Eye, User, Mail, Phone, Gift } from "lucide-react";

// Cell components that will use translations from parent
const NameCell = ({ row }) => (
  <div className="flex items-center gap-2">
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
      <User className="h-4 w-4" />
    </div>
    <span className="font-medium">{row.getValue("name")}</span>
  </div>
);

const ContactCell = ({ row }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1.5 text-sm">
      <Phone className="h-3 w-3 text-muted-foreground" />
      <span>{row.original.phone}</span>
    </div>
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Mail className="h-3 w-3" />
      <span>{row.original.email}</span>
    </div>
  </div>
);

const DateOfBirthCell = ({ row, notAvailable }) => (
  <span>{row.getValue("date_of_birth") || notAvailable}</span>
);

const GenderCell = ({ row, notAvailable }) => (
  <span className="capitalize">{row.getValue("gender") || notAvailable}</span>
);

const RewardCell = ({ row, eligible, notEligible }) => {
  const reward = row.getValue("reward");
  return (
    <div className="flex items-center gap-2">
      {reward ? (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          <Gift className="mr-1 h-3 w-3" />
          {eligible}
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-400">
          {notEligible}
        </span>
      )}
    </div>
  );
};

const ActionsCell = ({ row, viewDetailsText }) => (
  <Link href={`/merchant/customer-data/${row.original.id}`}>
    <Button variant="ghost" size="sm" className="flex items-center gap-2">
      <Eye className="h-4 w-4" />
      {viewDetailsText}
    </Button>
  </Link>
);

export const getCustomersColumns = (t) => [
  {
    accessorKey: "name",
    header: t("name"),
    cell: ({ row }) => <NameCell row={row} />,
  },
  {
    id: "contact",
    header: t("contactInfo"),
    cell: ({ row }) => <ContactCell row={row} />,
  },
  {
    accessorKey: "date_of_birth",
    header: t("dateOfBirth"),
    cell: ({ row }) => <DateOfBirthCell row={row} notAvailable={t("notAvailable")} />,
  },
  {
    accessorKey: "gender",
    header: t("gender"),
    cell: ({ row }) => <GenderCell row={row} notAvailable={t("notAvailable")} />,
  },
  {
    accessorKey: "reward",
    header: t("rewardStatus"),
    cell: ({ row }) => (
      <RewardCell 
        row={row} 
        eligible={t("reward.eligible")} 
        notEligible={t("reward.notEligible")} 
      />
    ),
  },
  {
    id: "actions",
    header: t("actions"),
    cell: ({ row }) => <ActionsCell row={row} viewDetailsText={t("viewDetails")} />,
  },
];
