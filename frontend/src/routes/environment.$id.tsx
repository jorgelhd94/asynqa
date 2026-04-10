import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/environment/$id")({
  component: EnvironmentPage,
});

function EnvironmentPage() {
  const { id } = Route.useParams();

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-[--color-black-950] text-[--color-black-50]"
      style={{
        background:
          "radial-gradient(circle at 15% 20%, rgba(215,40,169,0.08), transparent 32%), radial-gradient(circle at 80% 0%, rgba(153,73,182,0.12), transparent 30%), linear-gradient(145deg, #161320, #100d16 55%, #0d0a15)",
      }}
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold">Environment #{id}</h1>
        <p className="mt-2 text-[--color-black-400]">
          Asynq tools will be available here.
        </p>
      </div>
    </div>
  );
}
