import type { Metadata } from "next";
import StylishContactPage from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact - Pasan Ramyanath",
  description: "Get in touch with Pasan Ramyanath.",
};

export default function ContactPage() {
  return <StylishContactPage />;
}