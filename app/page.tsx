import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  // Automatically redirect to dashboard (no auth required)
  redirect("/dashboard");
}
