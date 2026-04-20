import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { prisma } from "@/lib/prisma";

function getEmailFromProfile(profile: any): string | null {
  const email =
    profile?.email ??
    profile?.preferred_username ??
    profile?.upn ??
    null;

  return typeof email === "string" ? email.toLowerCase() : null;
}

const APP_BASE = "/seguros";

export const authOptions: NextAuthOptions = {
  debug: true,

  pages: {
    signIn: "/seguros/login",
    error: "/seguros/login",
  },

  cookies: {
  sessionToken: {
    name: "__Secure-seguros.session-token",
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/seguros",
      secure: true,
    },
  },
  callbackUrl: {
    name: "__Secure-seguros.callback-url",
    options: {
      sameSite: "lax",
      path: "/seguros",
      secure: true,
    },
  },
  csrfToken: {
    name: "__Host-seguros.csrf-token",
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: true,
    },
  },
},

  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID ?? "common",
    }),
  ],

  callbacks: {
    async signIn({ user, profile }) {
      const email =
        (typeof user?.email === "string" ? user.email : null) ??
        (typeof (profile as any)?.email === "string" ? (profile as any).email : null) ??
        (typeof (profile as any)?.preferred_username === "string"
          ? (profile as any).preferred_username
          : null) ??
        (typeof (profile as any)?.upn === "string" ? (profile as any).upn : null);

      if (!email) return false;
      if (!email.toLowerCase().endsWith("@gndproperties.mx")) return false;

      return true;
    },

    async jwt({ token, profile }) {
      if (profile) {
        const email = getEmailFromProfile(profile);
        if (email) token.email = email;

        const tid = (profile as any)?.tid;
        if (typeof tid === "string") token.tid = tid;

        const name = (profile as any)?.name;
        if (typeof name === "string") token.name = name;
      }

      return token;
    },

    async session({ session, token }) {
      const email = typeof token.email === "string" ? token.email : null;

      if (session.user && email) {
        session.user.email = email;
      }

      if (email) {
        await prisma.user.upsert({
          where: { email },
          update: {
            name: typeof token.name === "string" ? token.name : undefined,
          },
          create: {
            email,
            name: typeof token.name === "string" ? token.name : undefined,
            role: "USER",
            isActive: true,
          },
        });
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      const origin = new URL(baseUrl).origin;

      if (url.startsWith("/")) {
        if (url.startsWith(APP_BASE)) return `${origin}${url}`;
        return `${origin}${APP_BASE}${url}`;
      }

      try {
        const target = new URL(url);

        if (target.origin === origin) {
          if (!target.pathname.startsWith(APP_BASE)) {
            target.pathname = `${APP_BASE}${target.pathname}`;
          }
          return target.toString();
        }

        return `${origin}${APP_BASE}/polizas`;
      } catch {
        return `${origin}${APP_BASE}/polizas`;
      }
    },
  },

  logger: {
    error(code, metadata) {
      console.error("NEXTAUTH_ERROR", code, metadata);
    },
    warn(code) {
      console.warn("NEXTAUTH_WARN", code);
    },
    debug(code, metadata) {
      console.log("NEXTAUTH_DEBUG", code, metadata);
    },
  },
};