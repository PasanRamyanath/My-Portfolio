import type { Metadata } from "next";
import SocialsSection from "../components/SocialsSection";

export const metadata: Metadata = {
  title: "Contact - Pasan Ramyanath",
  description: "Get in touch with Pasan Ramyanath.",
};

export default function ContactPage() {
  return <SocialsSection />;
}