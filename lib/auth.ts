import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const sessionTimeoutInSeconds =
  Number(process.env.SESSION_TIMEOUT_MINUTES! || 10) * 60;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: sessionTimeoutInSeconds,
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider !== "google") {
          return false;
        }

        await connectDB();

        const email = user.email?.toLowerCase();

        if (!email) {
          console.log("No email received from Google");
          return false;
        }

        let existingUser = await User.findOne({ email });

        if (!existingUser) {
          existingUser = await User.create({
            name: user.name || "",
            email,
            image: user.image || "",
            role: "manager",
            active: true,
          });

          console.log("New user created:", email);
        } else {
          if (!existingUser.active) {
            console.log("User is inactive:", email);
            return false;
          }

          let updated = false;

          if (!existingUser.name && user.name) {
            existingUser.name = user.name;
            updated = true;
          }

          if (!existingUser.image && user.image) {
            existingUser.image = user.image;
            updated = true;
          }

          if (updated) {
            await existingUser.save();
          }
        }

        // Attach database ID and role to the user object so the JWT callback can read it
        if (existingUser) {
          (user as any).id = existingUser._id?.toString();
          (user as any).role = existingUser.role;
        }

        return true;
      } catch (error) {
        console.error("SignIn Error:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      try {
        // When user logs in for the first time
        if (user) {
          token.id = (user as any).id;
          token.role = (user as any).role;
        } 
        
        // Ensure token has an id and role by checking the database if email exists
        if (token.email) {
          await connectDB();
          const dbUser = await User.findOne({ email: (token.email as string).toLowerCase() });
          if (dbUser) {
            token.id = dbUser._id ? dbUser._id.toString() : token.id;
            token.role = dbUser.role || token.role;
          }
        }

        return token;
      } catch (error) {
        console.error("JWT Error:", error);
        return token;
      }
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET!,
};
