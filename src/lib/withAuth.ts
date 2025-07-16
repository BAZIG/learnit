import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

interface AuthOptions {
  roles?: string[];
}

export function withAuth(
  handler: (req: Request, context?: Record<string, unknown>) => Promise<NextResponse>,
  options: AuthOptions = {}
) {
  return async (req: Request, context?: Record<string, unknown>) => {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;

      if (!token) {
        return NextResponse.json(
          { message: 'Authentication required' },
          { status: 401 }
        );
      }

      // Verify token
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'your-secret-key'
      );
      const { payload } = await jwtVerify(token, secret);

      // Check role if required
      if (options.roles && options.roles.length > 0) {
        const userRole = payload.role as string;
        if (!options.roles.includes(userRole)) {
          return NextResponse.json(
            { message: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      // Call the original handler
      return await handler(req, context);
    } catch {
      return NextResponse.json(
        { message: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
} 