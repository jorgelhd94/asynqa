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
          fill: "#1c1c1e",
          roundness: 4,
          styles: {
            title: "!text-[var(--color-text-primary)]",
            description: "!text-[var(--color-text-secondary)]",
          },
        }}
      />
    </>
  ),
});
