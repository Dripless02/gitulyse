import NextAuth from "next-auth/next";
import GitHubProvider from "next-auth/providers/github";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const authOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            authorization: {
                url: "https://github.com/login/oauth/authorize",
                params: { scope: "read:user user:email repo" },
            },
        }),
    ],
    callbacks: {
        // send access token to the backend
        async signIn(user, access, profile) {
            return true;
        },
        async jwt({ token, user, account, profile }) {
            if (account) {
                token.login = profile.login;
                token.accessToken = account.access_token;
            }
            return token;
        },
        async session({ session, token, user }) {
            session.accessToken = token.accessToken;
            session.login = token.login;
            return session;
        },
    },
};

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
