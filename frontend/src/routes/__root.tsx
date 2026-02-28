import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "sileo";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster theme="light" position="bottom-right" options={{
        styles:{
          description:"text-white!"
        }
      }} />
      <TanStackRouterDevtools position="bottom-left" />
    </>
  ),
});
