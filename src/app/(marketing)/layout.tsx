import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { MarketingChrome } from "@/components/layout/MarketingChrome";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <MarketingChrome>{children}</MarketingChrome>
    </SmoothScroll>
  );
}
