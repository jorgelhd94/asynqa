import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/environment/app-sidebar";
import { StatusBar } from "@/components/environment/status-bar";

export const Route = createFileRoute("/environment/$id")({
  component: EnvironmentLayout,
});

function EnvironmentLayout() {
  const { id } = Route.useParams();

  return (
    <SidebarProvider className="!min-h-screen">
      <AppSidebar environmentId={Number(id)} />
      <SidebarInset className="flex flex-col">
        <main className="flex flex-1 flex-col overflow-auto [&:has(>[data-full-bleed])]:overflow-hidden">
          <Outlet />
        </main>
        <StatusBar environmentId={Number(id)} />
      </SidebarInset>
    </SidebarProvider>
  );
}
