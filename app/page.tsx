import { headers } from "next/headers";
import { adminUser } from "@/lib/admin";
import Login from "./login";
import Studio from "./studio";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await adminUser(await headers());
  return user ? <Studio /> : <Login />;
}
