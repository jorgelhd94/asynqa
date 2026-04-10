import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/environment/app-sidebar";

export const Route = createFileRoute("/environment/$id")({
  component: EnvironmentLayout,
});

function EnvironmentLayout() {
  const { id } = Route.useParams();

  return (
    <SidebarProvider
      className=""
      style={{
        background:
          "radial-gradient(circle at 15% 20%, rgba(215,40,169,0.08), transparent 32%), radial-gradient(circle at 80% 0%, rgba(153,73,182,0.12), transparent 30%), linear-gradient(145deg, #161320, #100d16 55%, #0d0a15)",
      }}
    >
      <AppSidebar environmentId={Number(id)} />
      <SidebarInset>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
