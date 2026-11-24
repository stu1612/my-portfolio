import type { ComponentProps } from "react";

// Three lines of unequal length, right-aligned. Hover and keyboard focus look
// identical: the lines extend to full length (scale only, no layout change).
const line =
  "bg-current block h-px w-full origin-right transition-transform duration-(--duration-link) ease-out-soft motion-reduce:transition-none group-hover:scale-x-100 group-focus-visible:scale-x-100";

type MenuButtonProps = Omit<ComponentProps<"button">, "children"> & {
  expanded: boolean;
};

export function MenuButton({
  expanded,
  className = "",
  ...props
}: MenuButtonProps) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      className={`group focus-ring flex size-12 shrink-0 cursor-pointer items-center justify-center ${className}`}
      {...props}
    >
      <span className="sr-only">Menu</span>
      <span aria-hidden className="flex w-8 flex-col items-end gap-2">
        <span className={`${line} scale-x-50`} data-line />
        <span className={`${line} scale-x-75`} data-line />
        <span className={`${line} scale-x-100`} data-line />
      </span>
    </button>
  );
}
