// pages/machines/new.tsx
import { useState } from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";

export default function NewMachinePage() {
  const router = useRouter();
  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    generalNotes: "",
    maintenanceNotes: "",
    isActive: true,
  });
  const [placeholders, setPlaceholders] = useState({
    name: "asdf",
    description: "asdf",
    generalNotes: "asdf",
    maintenanceNotes: "asdf",
  });

  const handleCreate = async () => {
    const res = await fetch(`/api/machine/create`, {
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
      console.error("Failed to create machine.");
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
          <h1 className="text-3xl font-bold text-center">Create New Machine</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name:
              </label>
              <input
                className="mt-1 px-2 py-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-gray-700"
                name="name"
                value={formValues.name || ""}
                onChange={handleChange}
                placeholder={placeholders.name}
              />
            </div>

            {[
              { key: "description" as const, label: "Description" },
              { key: "generalNotes" as const, label: "General Notes" },
              { key: "maintenanceNotes" as const, label: "Maintenance Notes" },
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
                Create Machine
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
