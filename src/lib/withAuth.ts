import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

type Role = 'admin' | 'member' | 'visitor';

interface AuthOptions {
  roles: Role[];
}

type AuthenticatedRequest = NextRequest & {
  user: {
    id: string;
    role: Role;
  };
};

type ApiHandler = (req: AuthenticatedRequest, ...args: unknown[]) => Promise<NextResponse>;

export function withAuth(handler: ApiHandler, options: AuthOptions) {
  return async function (req: NextRequest, ...args: unknown[]) {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
      const { payload } = await jwtVerify(token, secret);
      const userRole = payload.role as Role;

      if (!options.roles.includes(userRole)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
      
      const authReq = req as AuthenticatedRequest;
      authReq.user = { id: payload.id as string, role: userRole };

      return handler(authReq, ...args);
    } catch {
      return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
    }
  };
} 