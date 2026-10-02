import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We could not complete this request. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="rounded-2xl border border-danger-100 bg-danger-50 p-8 text-center"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-danger-600">
        <AlertCircle className="h-5 w-5" />
      </div>

      <h2 className="mt-4 text-lg font-black text-danger-700">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-danger-700/80">
        {message}
      </p>

      {onRetry && (
        <div className="mt-5">
          <Button
            type="button"
            variant="outline"
            onClick={onRetry}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      )}
    </section>
  );
}