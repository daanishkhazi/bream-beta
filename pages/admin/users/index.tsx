import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import Layout from "@/components/Layout";
import prisma from "@/lib/prisma";
import Link from "next/link";
import GreenButton from "@/components/GreenButton";
import { User } from "@/types/dbTypes";

// UserItem component to represent a User
function UserItem({ user }: { user: User }) {
  return (
    <div className="flex justify-between items-start bg-white border-black border-2 shadow-nb p-4 mb-4 rounded hover:scale-[101%] transition ease-in-out delay-50">
      <div className="flex flex-col">
        <h3 className="text-lg font-bold">{user.name}</h3>
      </div>
      <div className="text-lg" title={user.role === "ADMIN" ? "Admin" : ""} />
      {`${user.role === "ADMIN" ? "ADMIN" : ""}`}
    </div>
  );
}

export default function Users({ users }: { users: User[] }) {
  return (
    <Layout>
      <div className="p-16 min-h-screen bg-[#FCFDF7]">
        <h1 className="text-4xl font-bold mb-8">User Management</h1>
        {users.map((user) => (
          <Link key={user.id} href={`/admin/users/${user.id}`}>
            <UserItem user={user} />
          </Link>
        ))}
        <GreenButton href="/admin/users/create-user" text="ADD USER" />
      </div>
    </Layout>
  );
}

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: async ({
    req,
    res,
  }): Promise<
    | { props: { users: any[] } }
    | { redirect: { destination: string; permanent: boolean } }
  > => {
    const session = await getSession(req, res);
    console.log(session);
    if (!session || !session.user) {
      return { props: { users: [] } };
    }

    const user = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      include: { tenant: true },
    });
    if (!user) {
      return { props: { users: [] } };
    }
    const isAdmin = user.role === "ADMIN";
    if (!isAdmin) {
      // If the user is not an admin, redirect them to the homepage (or wherever you want non-admin users to go)
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
    const users = await prisma.user.findMany({
      where: { tenantId: user.tenantId },
      select: {
        id: true,
        name: true,
        role: true,
        tenantId: true,
      },
    });
    console.log(users);
    return { props: { users } };
  },
});
