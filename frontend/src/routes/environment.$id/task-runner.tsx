import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCreateSavedRequest } from "@/hooks/use-task-runner";
import { TaskRunnerForm, type TaskRunnerFormValues } from "@/components/task-runner/task-runner-form";
import { taskrunner } from "../../../wailsjs/go/models";

export const Route = createFileRoute("/environment/$id/task-runner")({
  component: TaskRunnerPage,
});

function TaskRunnerPage() {
  const { id } = Route.useParams();
  const environmentId = Number(id);
  const navigate = useNavigate();
  const createMutation = useCreateSavedRequest(environmentId);

  const handleSaveAsNew = (values: TaskRunnerFormValues) => {
    const input = new taskrunner.CreateSavedRequestInput({
      name: values.taskType || "New Request",
      queue: values.queue,
      taskType: values.taskType,
      payload: values.payload,
      maxRetry: values.maxRetry ? parseInt(values.maxRetry, 10) : 0,
      timeoutSecs: values.timeoutSecs ? parseInt(values.timeoutSecs, 10) : 0,
      delaySecs: values.delaySecs ? parseInt(values.delaySecs, 10) : 0,
    });

    createMutation.mutate(input, {
      onSuccess: (saved) => {
        navigate({
          to: "/environment/$id/task-runner/$requestId",
          params: { id, requestId: String(saved.id) },
        });
      },
    });
  };

  return (
    <TaskRunnerForm
      environmentId={environmentId}
      onSave={handleSaveAsNew}
      isSaving={createMutation.isPending}
    />
  );
}
