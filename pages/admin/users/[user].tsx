import { withPageAuthRequired, getSession } from "@auth0/nextjs-auth0";
import Layout from "@/components/Layout";
import prisma from "@/lib/prisma";
import { User } from "@/types/dbTypes";
import { useState, useEffect } from "react";

interface SimpleMachine {
  id: number;
  name: string;
  associated: boolean;
}

export default function UserProfile({
  user,
  allMachines,
}: {
  user: User;
  allMachines: SimpleMachine[];
}) {
  // Define the state types
  const [machines, setMachines] = useState<Record<number, SimpleMachine>>({});
  const [role, setRole] = useState(user.role);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const machinesObj = allMachines.reduce(
      (acc: Record<number, SimpleMachine>, machine) => {
        acc[machine.id] = {
          ...machine,
          associated:
            user.machines?.some(
              (userMachine) => userMachine.id === machine.id
            ) || false,
        };
        return acc;
      },
      {}
    );
    setMachines(machinesObj);
  }, []);

  const handleCheckboxChange = (id: number) => {
    setMachines((prevMachines) => ({
      ...prevMachines,
      [id]: {
        ...prevMachines[id],
        associated: !prevMachines[id].associated,
      },
    }));
  };

  const handleRoleChange = () => {
    setRole((prevRole) => (prevRole === "ADMIN" ? "USER" : "ADMIN"));
  };

  const handleSubmit = async () => {
    const updatedMachines = Object.values(machines)
      .filter((machine) => machine.associated)
      .map((machine) => machine.id);
    const response = await fetch(`/api/user/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user.id,
        machines: updatedMachines,
        role: role,
      }),
      credentials: "include",
    });
    if (!response.ok) {
      console.log("Update failed");
    } else {
      setEditMode(false);
    }
  };

  return (
    <Layout>
      <div className="p-16 flex flex-col items-center min-h-screen bg-[#FCFdf7]">
        <div className="space-y-4 w-1/2 bg-white p-4 shadow-nb border-2 border-black rounded-lg h-full">
          <h1 className="text-4xl font-bold mb-8">User Profile</h1>
          <div>
            <h2 className="text-xl font-semibold mb-2">Machines</h2>
            {Object.values(machines).map((machine: SimpleMachine) => (
              <div key={machine.id} className="mb-2">
                <input
                  type="checkbox"
                  checked={machine.associated}
                  onChange={() => handleCheckboxChange(machine.id)}
                  disabled={!editMode}
                  className="mr-2"
                />
                <label className="text-gray-700">{machine.name}</label>
              </div>
            ))}
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold">User Role</h2>
            {editMode && (
              <p className="text-gray-700 italic mb-2">
                Note: Limit # of admins to as few as possible
              </p>
            )}
            <input
              type="checkbox"
              checked={role === "ADMIN"}
              onChange={handleRoleChange}
              disabled={!editMode}
              className="mr-2"
            />
            <label className="text-gray-700">Admin</label>
          </div>
          {editMode ? (
            <div>
              <button
                onClick={handleSubmit}
                className="mr-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-2 py-1 bg-cyan-700 rounded font-semibold border-black text-white border-2 shadow-nb-small hover:scale-[101%] transition ease-in-out delay-50"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: async (context) => {
    const { req, res, params } = context;
    const session = await getSession(req, res);
    if (!session || !session.user) {
      return { notFound: true };
    }

    const user = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
      include: { tenant: true },
    });

    if (!user) {
      return { notFound: true };
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

    // Get the requested user and their machines
    const requestedUser = await prisma.user.findUnique({
      where: { id: Number(params?.user) },
      include: {
        machines: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    console.log(requestedUser);
    if (!requestedUser) {
      return { notFound: true };
    }

    const allMachines = await prisma.machine.findMany({
      where: { tenantId: user.tenantId },
      select: {
        id: true,
        name: true,
      },
    });
    return { props: { user: requestedUser, allMachines } };
  },
});
