import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            channelHandle: string | null;
            bannerImage: string | null;
        } & DefaultSession['user'];
    }

    interface User extends DefaultUser {
        channelHandle?: string | null;
        bannerImage?: string | null;
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        id: string;
        channelHandle?: string | null;
        bannerImage?: string | null;
    }
}
