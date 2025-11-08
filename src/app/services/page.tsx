import type { Metadata } from "next";
import Services from "./ServicesClient";

export const metadata: Metadata = {
  title: "Services - Pasan Ramyanath",
  description: "Explore the services offered by Pasan Ramyanath.",
};

export default function ContactPage() {
  return <Services />;
}