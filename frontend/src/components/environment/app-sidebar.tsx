import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible } from "radix-ui";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  CalendarClock,
  ChevronRight,
  ChevronsUpDown,
  Database,
  Home,
  Layers,
  LayoutDashboard,
  ListChecks,
  PanelLeft,
  Plus,
  HardHat,
} from "lucide-react";
import { useEnvironment } from "@/hooks/use-environment";
import { useEnvironments } from "@/hooks/use-environments";
import { SidebarSavedRequests } from "./sidebar-saved-requests";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/environment/$id/dashboard" as const },
  { label: "Queues", icon: Layers, to: "/environment/$id/queues" as const },
  { label: "Tasks", icon: ListChecks, to: "/environment/$id/tasks" as const },
  { label: "Workers", icon: HardHat, to: "/environment/$id/workers" as const },
  { label: "Schedulers", icon: CalendarClock, to: "/environment/$id/schedulers" as const },
  { label: "Redis", icon: Database, to: "/environment/$id/redis" as const },
];

type AppSidebarProps = {
  environmentId: number;
};

export function AppSidebar({ environmentId }: AppSidebarProps) {
  const { data: environment, isLoading } = useEnvironment(environmentId);
  const { data: environments = [] } = useEnvironments();
  const location = useLocation();
  const navigate = useNavigate();
  const id = String(environmentId);

  const [monitoringOpen, setMonitoringOpen] = useState(true);
  const [newRequestDialogOpen, setNewRequestDialogOpen] = useState(false);

  const isActive = (to: string) => {
    const resolved = to.replace("$id", id);
    return location.pathname.startsWith(resolved);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-[var(--color-divider)]">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-[var(--color-primary-light)]"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[var(--color-accent-val)]/10">
                    <Database className="h-3.5 w-3.5 text-[var(--color-accent-val)]" />
                  </div>
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="mt-1 h-2.5 w-28" />
                      </>
                    ) : (
                      <>
                        <span className="truncate font-semibold text-[var(--color-text-primary)]">
                          {environment?.Name ?? "Unknown"}
                        </span>
                        <span className="truncate text-xs text-[var(--color-text-muted)]">
                          {environment?.Host}
                        </span>
                      </>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-auto h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                {environments.map((env) => (
                  <DropdownMenuItem
                    key={env.ID}
                    className={`gap-2 hover:!bg-[var(--color-row-hover)] ${env.ID === environmentId ? "bg-[var(--color-row-hover)]" : ""}`}
                    onClick={() =>
                      navigate({
                        to: "/environment/$id/dashboard",
                        params: { id: String(env.ID) },
                      })
                    }
                  >
                    <Database className="h-3.5 w-3.5 text-[var(--color-accent-val)]" />
                    <div className="grid text-xs leading-tight">
                      <span className="font-medium text-[var(--color-text-primary)]">{env.Name}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {env.Host}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2"
                  onClick={() => navigate({ to: "/" })}
                >
                  <Home className="h-3.5 w-3.5" />
                  <span>Manage environments</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="flex flex-col">
        {/* Collapsible Monitoring section */}
        <Collapsible.Root open={monitoringOpen} onOpenChange={setMonitoringOpen}>
          <SidebarGroup>
            <Collapsible.Trigger asChild>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text-secondary)]">
                <span>Monitoring</span>
                <ChevronRight
                  className={`ml-auto h-3 w-3 transition-transform duration-200 ${monitoringOpen ? "rotate-90" : ""}`}
                />
              </SidebarGroupLabel>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.to)}
                        tooltip={item.label}
                      >
                        <Link to={item.to} params={{ id }}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </Collapsible.Content>
          </SidebarGroup>
        </Collapsible.Root>

        <SidebarSeparator className="bg-[var(--color-divider)]" />

        {/* Task Runner section - takes remaining space */}
        <SidebarGroup className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
              Task Runner
            </span>
            <button
              onClick={() => setNewRequestDialogOpen(true)}
              className="flex h-5 w-5 items-center justify-center rounded text-[var(--color-text-muted)] hover:bg-[var(--color-row-hover)] hover:text-[var(--color-text-secondary)]"
              title="New Request"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <SidebarGroupContent className="flex min-h-0 flex-1 flex-col">
            {/* Saved requests list - scrollable */}
            <div className="flex-1 overflow-y-auto">
              <SidebarSavedRequests
                environmentId={environmentId}
                newDialogOpen={newRequestDialogOpen}
                onNewDialogClose={() => setNewRequestDialogOpen(false)}
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Toggle sidebar">
              <SidebarTrigger>
                <PanelLeft />
                <span>Collapse</span>
              </SidebarTrigger>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
