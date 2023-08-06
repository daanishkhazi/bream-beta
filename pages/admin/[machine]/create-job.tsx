import { useState } from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";

export default function NewJobPage() {
  const router = useRouter();
  const { machine } = router.query;
  const machineId = machine;
  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    setupNotes: "",
    operationNotes: "",
    qualityNotes: "",
    isActive: true,
    part: "",
    machineId: machineId,
  });
  const [placeholders, setPlaceholders] = useState({
    name: "Name",
    description:
      "Job requirements, part complexity, material characteristics, and intended function.",
    setupNotes:
      "Recommended tools, specific tooling arrangements, and setup best practices for the specific job.",
    operationNotes:
      "Best practices for safe operation, handling potential hazards, and precautions to prevent accidents.",
    qualityNotes:
      "Dimensional tolerances, surface finish requirements, special inspection techniques, and tools needed for quality assurance.",
    part: "Part",
  });
  const handleCreate = async () => {
    const res = await fetch(`/api/job/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formValues),
      credentials: "include",
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      // Handle error here
      console.error("Failed to create job.");
    }
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
      <div className="p-16 flex justify-center min-h-screen bg-[#FCFdf7]">
        <div className="space-y-4 w-1/2 bg-white border-2 border-black p-4 shadow-nb rounded-lg h-full">
          <h1 className="text-3xl font-bold text-center">Create New Job</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name:
              </label>
              <input
                className="mt-1 px-2 py-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-gray-700"
                name="name"
                value={formValues.name || ""}
                placeholder={placeholders.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Part:
              </label>
              <input
                className="mt-1 px-2 py-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-gray-700"
                name="part"
                value={formValues.part || ""}
                placeholder={placeholders.part}
                onChange={handleChange}
              />
            </div>

            {[
              { key: "description" as const, label: "Description" },
              { key: "setupNotes" as const, label: "Setup & Tooling Notes" },
              {
                key: "operationNotes" as const,
                label: "Operation & Safety Notes",
              },
              {
                key: "qualityNotes" as const,
                label: "Quality & Inspection Notes",
              },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700">
                  {label}:
                </label>
                <textarea
                  className="mt-1 px-2 py-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-gray-700"
                  name={key}
                  rows={4}
                  value={formValues[key] || ""}
                  onChange={handleChange}
                  placeholder={placeholders[key]}
                />
              </div>
            ))}

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formValues.isActive}
                  onChange={handleToggle}
                  className="h-4 w-4 text-gray-700 focus:ring-gray-700 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>

            <div>
              <button
                onClick={handleCreate}
                className="py-1 px-2 bg-green-700 rounded font-semibold border-black text-white border-2 shadow-nb-small hover:scale-[101%] transition ease-in-out delay-50"
              >
                Create Job
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
