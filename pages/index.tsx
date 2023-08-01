import Image from "next/image";
import { Inter } from "next/font/google";
import { useUser } from "@auth0/nextjs-auth0/client";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import Layout from "@/components/Layout";
import { User } from "@/types/dbTypes";
import prisma from "@/lib/prisma";
import VerificationComponent from "@/components/VerificationComponent";
import Chat from "@/components/Chat";

const inter = Inter({ subsets: ["latin"] });

export default function Home({ loadedUser }: { loadedUser: User }) {
  const { user, error, isLoading } = useUser();
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return user ? (
    <div>
      <Layout>
        <div className="flex bg-[#FCFDF7] min-h-screen justify-center p-16">
          {!loadedUser || !loadedUser.verified ? (
            <VerificationComponent loadedUser={loadedUser} />
          ) : (
            <Chat />
          )}
        </div>
      </Layout>
    </div>
  ) : (
    <div className="flex items-center justify-center min-h-screen bg-[#FCFDF7]">
      <div className="p-8 bg-white rounded-lg border-4 border-black shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Access Required</h2>
        <p className="text-gray-700 mb-4">Please log in to access Bream</p>
        <a
          href="/api/auth/login"
          className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-black justify-center flex w-full"
        >
          Log In
        </a>
      </div>
    </div>
  );
}

// get the user from the database with useSession and return the user object
export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: async ({
    params,
    req,
    res,
  }): Promise<{ props: { loadedUser: User | undefined } }> => {
    const session = await getSession(req, res);
    if (!session || !session.user) {
      return {
        props: { loadedUser: undefined },
      };
    }

    const loadedUser = await prisma.user.findUnique({
      where: {
        auth0Id: session.user.sub,
      },
      select: {
        id: true,
        name: true,
        tenantId: true,
        verified: true,
        role: true,
      },
    });

    if (!loadedUser) {
      return {
        props: { loadedUser: undefined },
      };
    }

    return {
      props: { loadedUser },
    };
  },
});
