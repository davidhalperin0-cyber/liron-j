// Global film-grain + vignette overlay — adds analog luxury depth.
// Pure CSS/SVG, no JS, no interactivity. Sits above content, below modals.

export function GrainOverlay() {
  return (
    <div aria-hidden className="luxe-grain pointer-events-none fixed inset-0 z-[60]" />
  );
}
