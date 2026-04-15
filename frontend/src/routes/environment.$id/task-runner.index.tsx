import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCreateSavedRequest } from "@/hooks/use-task-runner";
import { taskrunner } from "../../../wailsjs/go/models";

export const Route = createFileRoute("/environment/$id/task-runner/")({
  component: TaskRunnerIndex,
});

function TaskRunnerIndex() {
  const { id } = Route.useParams();
  const environmentId = Number(id);
  const navigate = useNavigate();
  const createMutation = useCreateSavedRequest(environmentId);

  useEffect(() => {
    const input = new taskrunner.CreateSavedRequestInput({
      name: "New Request",
      queue: "default",
      taskType: "",
      payload: "{\n  \n}",
      maxRetry: 0,
      timeoutSecs: 0,
      delaySecs: 0,
    });

    createMutation.mutate(input, {
      onSuccess: (saved) => {
        navigate({
          to: "/environment/$id/task-runner/$requestId",
          params: { id, requestId: String(saved.id) },
          replace: true,
        });
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
