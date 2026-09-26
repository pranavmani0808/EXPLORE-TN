import NumberFlow, { NumberFlowProps } from "@number-flow/react";
import { cn } from "@/lib/utils";

export interface AnimatedNumberProps extends NumberFlowProps {
  className?: string;
}

export function AnimatedNumber({
  value,
  className,
  format,
  ...props
}: AnimatedNumberProps) {
  return (
    <NumberFlow
      value={value}
      format={format}
      className={cn("font-semibold tracking-tight text-slate-900 dark:text-slate-100", className)}
      {...props}
    />
  );
}
