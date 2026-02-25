import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const rootRoute = createRootRoute({
  component: () => (
    <Suspense fallback={<div className="text-white">Cargando...</div>}>
      <Outlet />
    </Suspense>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: lazy(() => import("./routes/index")),
});

export const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
