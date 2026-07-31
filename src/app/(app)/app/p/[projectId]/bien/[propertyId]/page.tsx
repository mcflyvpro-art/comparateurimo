import { notFound } from "next/navigation";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";
import { FicheShell } from "@/components/app/fiche/FicheShell";
import { SectionHumain } from "@/components/app/fiche/SectionHumain";

export const dynamic = "force-dynamic";

export default async function PropertyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; propertyId: string }>;
  searchParams: Promise<{ vue?: string }>;
}) {
  const { projectId, propertyId } = await params;
  // Le mode d'affichage est lu ICI, côté serveur. La coque cliente ne doit
  // surtout pas le relire avec `useSearchParams()` — voir le commentaire dans
  // `FicheShell`, c'est ce qui empêchait toute la fiche de s'hydrater.
  const { vue } = await searchParams;
  const mode = vue === "complet" ? "complet" : "simple";

  const supabase = getDemoClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .eq("project_id", projectId)
    .eq("user_id", DEMO_USER_ID)
    .maybeSingle();

  if (!property) notFound();

  const { data: scenario } = await supabase
    .from("property_scenarios")
    .select("*")
    .eq("property_id", propertyId)
    .eq("user_id", DEMO_USER_ID)
    .maybeSingle();

  if (!scenario) notFound();

  const [contactRes, notesRes, photosRes, documentsRes] = await Promise.all([
    property.contact_id
      ? supabase
          .from("contacts")
          .select("*")
          .eq("id", property.contact_id)
          .eq("user_id", DEMO_USER_ID)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("property_notes")
      .select("id, kind, body, created_at")
      .eq("property_id", propertyId)
      .eq("user_id", DEMO_USER_ID)
      .order("created_at", { ascending: false }),
    supabase
      .from("property_photos")
      .select("id, storage_path, caption, sort_order")
      .eq("property_id", propertyId)
      .eq("user_id", DEMO_USER_ID)
      .order("sort_order"),
    supabase
      .from("property_documents")
      .select("id, storage_path, filename, doc_type")
      .eq("property_id", propertyId)
      .eq("user_id", DEMO_USER_ID),
  ]);

  const contact = contactRes.data ?? null;
  const notes = notesRes.data ?? [];
  const photos = photosRes.data ?? [];
  const documents = documentsRes.data ?? [];

  const [photosWithUrls, documentsWithUrls] = await Promise.all([
    Promise.all(
      photos.map(async (photo) => {
        const { data } = await supabase.storage.from("property-photos").createSignedUrl(photo.storage_path, 3600);
        return { ...photo, signedUrl: data?.signedUrl ?? "" };
      }),
    ),
    Promise.all(
      documents.map(async (doc) => {
        const { data } = await supabase.storage.from("property-documents").createSignedUrl(doc.storage_path, 3600);
        return { ...doc, signedUrl: data?.signedUrl ?? "" };
      }),
    ),
  ]);

  return (
    <FicheShell
      property={property}
      scenario={scenario}
      propertyId={propertyId}
      projectId={projectId}
      mode={mode}
      humanSection={
        <SectionHumain
          property={property}
          contact={contact}
          notes={notes}
          photos={photosWithUrls}
          documents={documentsWithUrls}
          propertyId={propertyId}
          projectId={projectId}
        />
      }
    />
  );
}
