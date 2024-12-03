import { Container } from "@/components/container";

export default function CollectionsLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <Container>
      <div className="w-full">{children}</div>
    </Container>
  );
}
