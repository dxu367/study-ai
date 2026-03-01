import { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        "bg-white rounded-xl border border-gray-200 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge("px-6 py-4 border-b border-gray-100", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}
