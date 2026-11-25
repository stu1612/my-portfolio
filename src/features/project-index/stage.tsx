/**
 * The homepage's dark gradient stage. Decorative and static: it sits behind
 * the whole frame (Shell's `stage` slot) and never changes colour.
 */
export function Stage() {
  return (
    <div
      aria-hidden="true"
      data-stage
      className="stage-fields pointer-events-none absolute inset-0 -z-10"
    >
      <div className="stage-grain absolute inset-0" />
    </div>
  );
}
