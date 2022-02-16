import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      name: string;
      email: string | null;
      image: string;
    };
    expires: string;
    discordID: string;
    userID: string;
  }

  /**
   * Usually contains information about the provider being used
   * and also extends `TokenSet`, which is different tokens returned by OAuth Providers.
   */
  // interface Account {}

  /** The OAuth profile returned from your provider */
  // interface Profile {}
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    name: string;
    email?: string;
    picture: string;
    sub: string;
    discordID: string;
    userID: string;
    iat: number;
    exp: number;
    jti: string;
  }
}
