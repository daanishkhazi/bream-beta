// pages/jobs/[machineId]/[jobId].tsx
import { useState, useEffect } from "react";
import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import prisma from "@/lib/prisma";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { Job } from "@/types/dbTypes";
import Link from "next/link";

export default function JobPage({ job }: { job: Job }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState(job);

  useEffect(() => {
    setFormValues(job);
  }, [job]);

  const handleEdit = () => {
    setIsEditing(true);
    console.log(formValues);
  };

  const handleSave = async () => {
    const res = await fetch(`/api/job/${job.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formValues),
    });

    if (res.ok) {
      setIsEditing(false);
    } else {
      console.error("Failed to update job.");
    }
  };

  const handleCancel = () => {
    setFormValues(job);
    setIsEditing(false);
  };

  const handleChange = (e: any) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleToggle = (e: any) => {
    setFormValues({
      ...formValues,
      isActive: e.target.checked,
    });
  };

  return (
    <Layout>
      <div className="p-16 flex flex-col items-center min-h-screen bg-[#FCFdf7]">
        <div className="space-y-4 w-1/2 bg-white p-4 shadow-nb border-2 border-black rounded-lg h-full">
          <h1 className="text-3xl font-bold text-center">{formValues.name}</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Name:
              </label>
              {isEditing ? (
                <input
                  className="mt-1 px-2 py-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-gray-700"
                  name="name"
                  value={formValues.name || ""}
                  onChange={handleChange}
                />
              ) : (
                <p className="mt-1">{formValues.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">
                Part:
              </label>
              {isEditing ? (
                <input
                  className="mt-1 px-2 py-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-gray-700"
                  name="part"
                  value={formValues.part || ""}
                  onChange={handleChange}
                />
              ) : (
                <p className="mt-1">{formValues.part}</p>
              )}
            </div>

            {[
              { key: "description" as const, label: "Description" },
              { key: "setupNotes" as const, label: "Setup Notes" },
              { key: "operationNotes" as const, label: "Operation Notes" },
              { key: "qualityNotes" as const, label: "Quality Notes" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-bold text-gray-700">
                  {label}:
                </label>
                {isEditing ? (
                  <textarea
                    className="mt-1 px-2 py-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-gray-700"
                    name={key}
                    rows={4}
                    value={formValues[key] || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="mt-1">{formValues[key]}</p>
                )}
              </div>
            ))}

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formValues.isActive}
                  onChange={handleToggle}
                  disabled={!isEditing}
                  className="h-4 w-4 text-gray-700 focus:ring-gray-700 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>

            {isEditing ? (
              <div>
                <button
                  onClick={handleSave}
                  className="mr-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
                >
                  Save changes
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleEdit}
                className="px-2 bg-cyan-700 rounded font-semibold border-black text-white border-2 shadow-nb-small hover:scale-[101%] transition ease-in-out delay-50"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: async ({
    req,
    res,
    params,
  }): Promise<
    | { props: { job: Job | null } }
    | { redirect: { destination: string; permanent: boolean } }
  > => {
    const session = await getSession(req, res);

    if (
      !session ||
      !session.user ||
      !params ||
      typeof params.machine !== "string" ||
      typeof params.job !== "string"
    ) {
      return { props: { job: null } };
    }

    const user = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      include: { tenant: true },
    });

    if (!user) {
      return { props: { job: null } };
    }
    const isAdmin = user.role === "ADMIN";
    if (!isAdmin) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
    let jobId = parseInt(params.job, 10);
    if (isNaN(jobId)) {
      return { props: { job: null } };
    }
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        name: true,
        description: true,
        setupNotes: true,
        operationNotes: true,
        qualityNotes: true,
        isActive: true,
        machineId: true,
        part: true,
      },
    });
    return { props: { job } };
  },
});
