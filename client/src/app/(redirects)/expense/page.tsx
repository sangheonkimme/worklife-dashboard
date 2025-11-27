import { redirect } from "next/navigation";

export default function LegacyExpensePage() {
  redirect("/dashboard/expense");
}

