import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    // For demo purposes, return all projects
    // In production, you would filter by user ID from the auth token
    const projects = await db.project.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      projects: projects.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, userId = 'demo-user' } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Create or find user for demo
    let user = await db.user.findFirst();
    if (!user) {
      user = await db.user.create({
        data: {
          email: 'demo@flutterforge.dev',
          name: 'Demo User',
          firebaseUid: 'demo-firebase-uid',
        },
      });
    }

    const project = await db.project.create({
      data: {
        name,
        description: description || '',
        widgetTree: JSON.stringify({
          id: 'root',
          type: 'Scaffold',
          name: 'Scaffold',
          properties: {},
          children: [],
        }),
        userId: user.id,
      },
    });

    return NextResponse.json({
      project: {
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
