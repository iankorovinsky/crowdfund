
"use client";

import { useParams } from "next/navigation";
import Room from "@/components/Room";
const layout = ({ children }: { children: React.ReactNode }) => {
  const { id } = useParams();

  return <Room roomId={id as string}>{children}</Room>;
};

export default layout;
