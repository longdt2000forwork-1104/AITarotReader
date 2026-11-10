export function generateStaticParams() {
  return [{ id: "demo-session" }, { id: "default" }];
}

export default function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
