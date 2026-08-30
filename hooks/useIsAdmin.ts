import { useSession } from "next-auth/react";

export const useIsAdmin = () => {
  const { data: session } = useSession();
  const role = session?.user?.role;
  return role === "admin" || role === "supreme";
};
