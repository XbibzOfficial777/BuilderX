import { NextRequest, NextResponse } from 'next/server';
import { get, ref } from 'firebase/database';
import { database } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.length < 1) {
    return NextResponse.json({ users: [] });
  }

  try {
    // Users are stored at users/ path with UID as key
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ users: [] });
    }

    const data = snapshot.val();
    
    // Convert to array
    const usersArray: any[] = [];
    
    for (const key of Object.keys(data)) {
      const item = data[key];
      if (item && typeof item === 'object') {
        usersArray.push({
          uid: key,
          ...item
        });
      }
    }

    // Search by username or displayName
    const searchQuery = query.toLowerCase().replace('@', '');
    
    const filteredUsers = usersArray.filter((user) => {
      const username = (user.username || '').toLowerCase();
      const displayName = (user.displayName || '').toLowerCase();
      
      return (
        username.includes(searchQuery) || 
        username === searchQuery ||
        displayName.includes(searchQuery)
      );
    });

    const users = filteredUsers
      .map((user) => ({
        uid: user.uid,
        username: user.username,
        displayName: user.displayName || user.username,
        photoURL: user.photoURL || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        joinedAt: user.joinedAt || 0,
        fileCount: user.fileCount || 0,
        totalStorageUsed: user.totalStorageUsed || 0,
      }))
      .slice(0, 10);

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ users: [], error: error.message }, { status: 500 });
  }
}
