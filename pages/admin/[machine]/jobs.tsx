import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import Layout from "@/components/Layout";
import prisma from "@/lib/prisma";
import { Role } from "@/types/dbTypes";
import Link from "next/link";
import JobItem from "@/components/JobItem";
import GreenButton from "@/components/GreenButton";
import { Job } from "@/types/dbTypes";

export default function Admin({ jobs }: { jobs: Job[] }) {
  return (
    <Layout>
      <div className="p-16 min-h-screen bg-[#FCFDF7]">
        <h1 className="text-4xl font-bold mb-8">Jobs</h1>
        {jobs.map((job) => (
          <JobItem key={job.id} job={job} />
        ))}
        <GreenButton href="/admin/create-job" text="ADD JOB" />
      </div>
    </Layout>
  );
}

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: async ({
    params,
    req,
    res,
  }): Promise<{ props: { jobs: Job[] } }> => {
    const session = await getSession(req, res);

    if (!session || !session.user) {
      return { props: { jobs: [] } };
    }

    const user = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      include: { tenant: true },
    });

    if (!user) {
      return { props: { jobs: [] } };
    }
    if (!params) {
      return { props: { jobs: [] } };
    }
    const machineId =
      typeof params.machine === "string"
        ? parseInt(params.machine, 10)
        : undefined;

    if (machineId === undefined || isNaN(machineId)) {
      return { props: { jobs: [] } };
    }

    console.log(params);
    const jobs = await prisma.job.findMany({
      where: { machineId: machineId }, // Fetch jobs associated with the machineId
      select: {
        id: true,
        description: true,
        name: true,
        part: true,
        isActive: true,
        machineId: true,
      },
    });
    return { props: { jobs } };
  },
});
