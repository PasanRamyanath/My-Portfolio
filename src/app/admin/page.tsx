import type { Metadata } from "next";
import AdminPage from "./AdminClient";

export const metadata: Metadata = {
  title: "Admin - Pasan Ramyanath",
  description: "Admin panel for Pasan Ramyanath.",
};

export default function AdminPageWrapper() {
  return <AdminPage />;
}