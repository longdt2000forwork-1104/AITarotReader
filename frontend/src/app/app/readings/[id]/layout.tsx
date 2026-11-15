export function generateStaticParams() {
  return [{ id: 'latest' }];
}

export default function ReadingSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
