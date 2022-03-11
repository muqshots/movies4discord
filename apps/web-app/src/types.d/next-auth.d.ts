import "next-auth";

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

    userID: string;
    admin: boolean;
  }

  interface User {
    id: string;
    admin: boolean;
  }

  /**
   * Usually contains information about the provider being used
   * and also extends `TokenSet`, which is different tokens returned by OAuth Providers.
   */
  // interface Account {}

  /** The OAuth profile returned from your provider */
  // interface Profile {}
}
