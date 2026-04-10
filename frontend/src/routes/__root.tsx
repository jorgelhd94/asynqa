import { Outlet, createRootRoute } from "@tanstack/react-router";
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
    </>
  ),
});
