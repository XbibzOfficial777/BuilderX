import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { username } = await params;
  const cleanUsername = username?.replace('@', '').toLowerCase();

  if (!cleanUsername) {
    return {
      title: 'User Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbox-manager.vercel.app';
  const title = `@${cleanUsername} - Profile | Catbox Manager Pro`;
  const description = `View @${cleanUsername}'s profile and shared files on Catbox Manager Pro`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/user/${cleanUsername}`,
      type: 'profile',
      username: cleanUsername,
      images: [
        {
          url: '/og-image.png',
          width: 1344,
          height: 768,
          alt: `@${cleanUsername}'s profile on Catbox Manager Pro`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    other: {
      'profile:username': cleanUsername,
    },
  };
}

export default function UserProfileLayout({ children }: Props) {
  return <>{children}</>;
}
