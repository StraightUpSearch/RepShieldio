import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = "md", text, className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("min-h-screen flex flex-col items-center justify-center", className)}>
      <div 
        className={cn(
          "animate-spin border-4 border-primary border-t-transparent rounded-full",
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="mt-4 text-muted-foreground">{text}</p>
      )}
    </div>
  );
}