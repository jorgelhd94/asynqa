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
  Play,
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
];

const toolItems = [
  { label: "Task Runner", icon: Play, to: "/environment/$id/task-runner" as const },
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
    <Sidebar collapsible="icon" className="border-r-[--color-black-800]/50">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="cursor-pointer data-[state=open]:bg-sidebar-accent"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[--color-electric-rose-500]/15">
                    <Database className="h-4 w-4 text-[--color-electric-rose-300]" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    {isLoading ? (
                      <>
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="mt-1 h-3 w-32" />
                      </>
                    ) : (
                      <>
                        <span className="truncate font-semibold">
                          {environment?.Name ?? "Unknown"}
                        </span>
                        <span className="truncate text-xs text-sidebar-foreground/60">
                          {environment?.Host}
                        </span>
                      </>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4 text-sidebar-foreground/40" />
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
                    className={`cursor-pointer gap-2 ${env.ID === environmentId ? "bg-accent" : ""}`}
                    onClick={() =>
                      navigate({
                        to: "/environment/$id/dashboard",
                        params: { id: String(env.ID) },
                      })
                    }
                  >
                    <Database className="h-4 w-4 text-[--color-electric-rose-300]" />
                    <div className="grid text-sm leading-tight">
                      <span className="font-medium">{env.Name}</span>
                      <span className="text-xs text-muted-foreground">
                        {env.Host}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer gap-2"
                  onClick={() => navigate({ to: "/" })}
                >
                  <Home className="h-4 w-4" />
                  <span>Manage environments</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.to)}
                    tooltip={item.label}
                  >
                    <Link
                      to={item.to}
                      params={{ id }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.to)}
                    tooltip={item.label}
                  >
                    <Link
                      to={item.to}
                      params={{ id }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Toggle sidebar"
              className="cursor-pointer"
            >
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
