import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  // TEMP (testes): guarda de autenticação desativado. Para reativar, restaure:
  //   import { redirect } from "@tanstack/react-router";
  //   import { supabase } from "@/integrations/supabase/client";
  //   beforeLoad: async () => {
  //     const { data } = await supabase.auth.getUser();
  //     if (!data.user) throw redirect({ to: "/auth" });
  //   },
  component: () => <Outlet />,
});
