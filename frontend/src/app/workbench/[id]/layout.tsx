export function generateStaticParams() {
  return [{ id: 'latest' }];
}

export default function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
