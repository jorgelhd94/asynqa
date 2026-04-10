import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "sileo";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster
        theme="dark"
        position="bottom-right"
        options={{
          fill: "#1e1b2e",
          roundness: 16,
          styles: {
            title: "!text-[--color-black-50]",
            description: "!text-[--color-black-300]",
          },
        }}
      />
      <TanStackRouterDevtools position="bottom-left" />
    </>
  ),
});
