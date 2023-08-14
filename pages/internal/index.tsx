import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { useState } from "react";
import Layout from "@/components/Layout";
import prisma from "@/lib/prisma";
import { z } from "zod";

const formSchema = z.object({
  tenantName: z.string(),
  email: z.string().email(),
  name: z.string(),
});

// The actual component, only a placeholder
export default function BreamDashboard() {
  const [tenantName, setTenantName] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageColor, setMessageColor] = useState("green");

  const handleCreate = async () => {
    try {
      formSchema.parse({ tenantName, email, name });
      const res = await fetch(`/api/tenant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tenantName, email, name }),
        credentials: "include",
      });

      if (res.ok) {
        setMessage("Tenant created, and code sent!");
        setMessageColor("green");
        setTenantName("");
        setEmail("");
        setName("");
      } else {
        setMessage("Failed to create tenant and send code. Please try again.");
        setMessageColor("red");
      }
    } catch (err) {
      setMessage("Validation error. Please fill in all fields correctly.");
      setMessageColor("red");
    }
  };

  const handleTenantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTenantName(e.target.value);
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  return (
    <Layout>
      <div className="px-16 py-12 min-h-screen bg-[#FCFDF7]">
        <h1 className="text-4xl font-bold mb-8">BREAM Employee Dashboard</h1>
        <div className="px-32 py-16">
          <h1 className="text-3xl font-bold text-center">Create Customer</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Tenant Name:
              </label>
              <input
                className="mt-1 px-2 py-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-gray-700"
                name="tenantName"
                type="text"
                value={tenantName}
                onChange={handleTenantNameChange}
                placeholder="Enter tenant name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Email:
              </label>
              <input
                className="mt-1 px-2 py-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-gray-700"
                name="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">
                Name:
              </label>
              <input
                className="mt-1 px-2 py-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-gray-700"
                name="name"
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Enter name"
              />
            </div>
            <div>
              <button
                onClick={handleCreate}
                className="py-1 px-2 bg-green-700 rounded font-semibold border-black text-white border-2 shadow-nb-small hover:scale-[101%] transition ease-in-out delay-50"
              >
                Send Code
              </button>
              {message && (
                <p style={{ color: messageColor }} className="mt-2">
                  {message}
                </p>
              )}
            </div>
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
  }): Promise<
    { props: {} } | { redirect: { destination: string; permanent: boolean } }
  > => {
    const session = await getSession(req, res);
    if (!session || !session.user) {
      return { props: {} };
    }

    const user = await prisma.user.findUnique({
      where: {
        auth0Id: session.user.sub,
      },
    });

    if (!user || !user.breamEmployee) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    return { props: {} };
  },
});
