import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/environment/$id/")({
  component: () => {
    const { id } = Route.useParams();
    return <Navigate to="/environment/$id/dashboard" params={{ id }} />;
  },
});
