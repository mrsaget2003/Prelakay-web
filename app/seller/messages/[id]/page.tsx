"use client";

import { useParams } from "next/navigation";
import { SellerMessages } from "@/components/seller/messages";

export default function Thread() {
  const { id } = useParams<{ id: string }>();
  return <SellerMessages key={id} cur={decodeURIComponent(id)} />;
}
