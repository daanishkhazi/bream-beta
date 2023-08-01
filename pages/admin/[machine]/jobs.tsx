import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import Layout from "@/components/Layout";
import prisma from "@/lib/prisma";
import { Role } from "@/types/dbTypes";
import Link from "next/link";
import JobItem from "@/components/JobItem";
import GreenButton from "@/components/GreenButton";
import { Job } from "@/types/dbTypes";
import { useRouter } from "next/router";

export default function Admin({ jobs }: { jobs: Job[] }) {
  const router = useRouter();
  const { machine } = router.query;
  return (
    <Layout>
      <div className="p-16 min-h-screen bg-[#FCFDF7]">
        <h1 className="text-4xl font-bold mb-8">Jobs</h1>
        {jobs.map((job) => (
          <Link key={job.id} href={`/admin/${machine}/${job.id}`}>
            <JobItem job={job} />
          </Link>
        ))}
        <GreenButton href={`/admin/${machine}/create-job`} text="ADD JOB" />
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
    const machineId = params.machine;

    const jobs = await prisma.job.findMany({
      where: { machineId: machineId as string }, // Fetch jobs associated with the machineId
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
