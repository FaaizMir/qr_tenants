import { redirect } from "next/navigation";

export default function Home() {
  // Redirect root locale page to the login screen
  redirect(`/login`);
}

