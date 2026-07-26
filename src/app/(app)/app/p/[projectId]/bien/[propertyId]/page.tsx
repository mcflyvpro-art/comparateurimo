import Link from "next/link";
import { notFound } from "next/navigation";
import { getDemoClient, DEMO_USER_ID } from "@/lib/supabase/demo";
import { FicheScenarioSections } from "@/components/app/fiche/FicheScenarioSections";
import { SectionHumain } from "@/components/app/fiche/SectionHumain";

export const dynamic = "force-dynamic";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; propertyId: string }>;
}) {
  const { projectId, propertyId } = await params;
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
    <div className="mx-auto max-w-4xl px-6 py-8">
      <Link href={`/app/p/${projectId}`} className="text-sm text-muted transition-colors hover:text-text">
        ← Retour au projet
      </Link>
      <h1 className="mt-3 font-sans text-2xl font-semibold text-text">
        {property.address ?? "Adresse non renseignée"}
      </h1>
      <p className="text-sm text-muted">{property.city ?? "—"}</p>

      <div className="mt-6 flex flex-col gap-6">
        <FicheScenarioSections property={property} scenario={scenario} propertyId={propertyId} />
        <SectionHumain
          property={property}
          contact={contact}
          notes={notes}
          photos={photosWithUrls}
          documents={documentsWithUrls}
          propertyId={propertyId}
        />
      </div>

      <p className="mt-8 border-t border-border pt-4 text-xs text-faint">
        Estio est un outil d&apos;aide à la décision, pas un conseil en investissement réglementé. Vérifie toujours
        les chiffres importants auprès d&apos;un professionnel avant de t&apos;engager.
      </p>
    </div>
  );
}
