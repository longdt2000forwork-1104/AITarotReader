export function generateStaticParams() {
  return [{ id: "demo" }, { id: "default" }];
}

export default function ReadingDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
