import { useSession } from "next-auth/react";

export const useIsAdmin = () => {
  const { data: session } = useSession();
  return session?.user?.role === "admin" || session?.user?.role === "supreme";
};
