import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/environment/$id/task-runner")({
  component: TaskRunnerLayout,
});

function TaskRunnerLayout() {
  return <Outlet />;
}
