import { useAuth } from "./useAuth";

const ELITE_EMAILS = ["yourpham@gmail.com", "illestrj.12@gmail.com", "asantimokwala48@gmail.com"];

export const useEliteAccess = () => {
  const { user, loading } = useAuth();
  const isElite = !loading && !!user && ELITE_EMAILS.includes(user.email ?? "");
  return { isElite, loading };
};
