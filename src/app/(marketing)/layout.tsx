import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { PageLoader } from "@/components/layout/PageLoader";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <PageLoader />
      <SiteHeader />
      {children}
      <SiteFooter />
    </SmoothScroll>
  );
}
