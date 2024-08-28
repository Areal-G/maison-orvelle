/** Re-mounts on every navigation, so each page arrives under an ivory veil that lifts away. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="page-veil" aria-hidden="true" />
      {children}
    </>
  );
}
