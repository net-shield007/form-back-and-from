export const metadata = {
  metadataBase: new URL("https://feedback.tritorc.com"),
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
