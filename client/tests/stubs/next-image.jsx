// Test stand-in for next/image.
export default function Image({ fill, unoptimized, ...p }) {
  return <img data-unoptimized={String(Boolean(unoptimized))} {...p} />;
}