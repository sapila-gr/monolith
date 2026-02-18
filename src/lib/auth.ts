import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { genericOAuth } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
      },
    },
  },

  socialProviders: {
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },

  plugins: [
    ...(process.env.INSTAGRAM_APP_ID && process.env.INSTAGRAM_APP_SECRET
      ? [
          genericOAuth({
            config: [
              {
                providerId: "instagram",
                clientId: process.env.INSTAGRAM_APP_ID,
                clientSecret: process.env.INSTAGRAM_APP_SECRET,
                authorizationUrl: "https://api.instagram.com/oauth/authorize",
                tokenUrl: "https://api.instagram.com/oauth/access_token",
                userInfoUrl: "https://graph.instagram.com/me?fields=id,username",
                scopes: ["user_profile", "user_media"],
                mapProfileToUser: (profile: Record<string, unknown>) => ({
                  name: (profile.username as string) || "User",
                  email: `${profile.id}@instagram.local`,
                  image: null,
                }),
              },
            ],
          }),
        ]
      : []),
    nextCookies(),
  ],

  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ],
});

export type Auth = typeof auth;
