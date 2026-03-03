import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  children: React.ReactNode;
  params: Promise<{ short: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { short } = await params;

  if (!short) {
    return {
      title: 'Album Not Found',
    };
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbox-manager.vercel.app';

    const title = `Album - Catbox Manager Pro`;
    const description = 'View and manage album files on Catbox Manager Pro';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${siteUrl}/albums/${short}`,
        type: 'website',
        images: [
          {
            url: '/og-image.png',
            width: 1344,
            height: 768,
            alt: 'Catbox Manager Pro Album',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ['/og-image.png'],
      },
    };
  } catch (error) {
    console.error('Error generating album metadata:', error);
    return {
      title: `Album - Catbox Manager Pro`,
      description: 'View and manage album files on Catbox Manager Pro',
    };
  }
}

export default function AlbumLayout({ children }: Props) {
  return <>{children}</>;
}
