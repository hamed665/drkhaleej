import type { ReactNode } from "react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HospitalDetailHoldLayout({ children }: { children: ReactNode }) {
  notFound();
  return children;
}
