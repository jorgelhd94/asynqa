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
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  CalendarClock,
  ChevronsUpDown,
  Database,
  Home,
  Layers,
  LayoutDashboard,
  ListChecks,
  PanelLeft,
  Send,
  HardHat,
} from "lucide-react";
import { useEnvironment } from "@/hooks/use-environment";
import { useEnvironments } from "@/hooks/use-environments";

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

  const isActive = (to: string) => {
    const resolved = to.replace("$id", id);
    return location.pathname.startsWith(resolved);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-[--color-divider]">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-[--color-primary-light]"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[--color-accent]/10">
                    <Database className="h-3.5 w-3.5 text-[--color-accent]" />
                  </div>
                  <div className="grid flex-1 text-left text-xs leading-tight">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="mt-1 h-2.5 w-28" />
                      </>
                    ) : (
                      <>
                        <span className="truncate font-semibold text-[--color-text-primary]">
                          {environment?.Name ?? "Unknown"}
                        </span>
                        <span className="truncate text-[10px] text-[--color-text-muted]">
                          {environment?.Host}
                        </span>
                      </>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-auto h-3.5 w-3.5 text-[--color-text-muted]" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                {environments.map((env) => (
                  <DropdownMenuItem
                    key={env.ID}
                    className={`gap-2 ${env.ID === environmentId ? "bg-[--color-primary-light]" : ""}`}
                    onClick={() =>
                      navigate({
                        to: "/environment/$id/dashboard",
                        params: { id: String(env.ID) },
                      })
                    }
                  >
                    <Database className="h-3.5 w-3.5 text-[--color-accent]" />
                    <div className="grid text-xs leading-tight">
                      <span className="font-medium text-[--color-text-primary]">{env.Name}</span>
                      <span className="text-[10px] text-[--color-text-muted]">
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

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-[--color-text-muted]">
            Monitoring
          </SidebarGroupLabel>
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
        </SidebarGroup>

        <SidebarSeparator className="bg-[--color-divider]" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-[--color-text-muted]">
            Task Runner
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/environment/$id/task-runner")}
                  tooltip="Task Runner"
                >
                  <Link to="/environment/$id/task-runner" params={{ id }}>
                    <Send />
                    <span>New Request</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
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
