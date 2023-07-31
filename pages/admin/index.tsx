import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { useState } from "react";
import Layout from "@/components/Layout";
import prisma from "@/lib/prisma";
import { Role } from "@/types/dbTypes";
import Link from "next/link";
import MachineItem from "@/components/MachineItem";
import { Machine } from "@/types/dbTypes";
import GreenButton from "@/components/GreenButton";

export default function Admin({ machines }: { machines: Machine[] }) {
  return (
    <Layout>
      <div className="px-16 py-12 min-h-screen bg-[#FCFDF7]">
        {/* link on the right */}
        <div className="flex justify-end mb-8">
          <Link href="/admin/users" className="text-blue-700">
            Manage Users
          </Link>
        </div>
        <h1 className="text-4xl font-bold mb-8">Work Centers</h1>
        {machines.map((machine) => (
          <Link key={machine.id} href={`/admin/${machine.id}`}>
            <MachineItem machine={machine} />
          </Link>
        ))}
        <GreenButton href="/admin/create-machine" text="ADD WORK CENTER" />
      </div>
    </Layout>
  );
}

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: async ({
    req,
    res,
  }): Promise<
    | { props: { machines: Machine[] } }
    | { redirect: { destination: string; permanent: boolean } }
  > => {
    const session = await getSession(req, res);
    if (!session || !session.user) {
      return { props: { machines: [] } };
    }

    const user = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      include: { tenant: true },
    });
    if (!user) {
      return { props: { machines: [] } };
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
    const machines = await prisma.machine.findMany({
      where: { tenantId: user.tenantId },
      select: {
        id: true,
        name: true,
        description: true,
        generalNotes: true,
        maintenanceNotes: true,
        prompt: true,
        isActive: true,
        tenantId: true,
      },
    });

    return { props: { machines } };
  },
});
