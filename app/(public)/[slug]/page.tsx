import { redirect } from 'next/navigation';

export default async function LegacyPublicSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/public/${slug}`);
}
