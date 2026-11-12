import { redirect } from 'next/navigation';

export default async function LegacyPublicSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { slug } = await params;
  const { bookingId } = await searchParams;

  const target = bookingId
    ? `/public/${slug}/success?bookingId=${bookingId}`
    : `/public/${slug}`;
  redirect(target);
}
