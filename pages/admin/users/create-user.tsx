import { useState } from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "@/components/Layout";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email(),
});

export default function NewMachinePage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageColor, setMessageColor] = useState("green");

  const handleCreate = async () => {
    try {
      emailSchema.parse({ email });
      const res = await fetch(`/api/code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      if (res.ok) {
        setMessage("Congratulations! Code sent, feel free to send another.");
        setMessageColor("green");
        setEmail(""); // Reset email field for next input
      } else {
        setMessage(
          "Failed to send code. Please use a valid email and try again."
        );
        setMessageColor("red");
      }
    } catch (err) {
      setMessage(
        "Failed to send code. Please use a valid email and try again."
      );
      setMessageColor("red");
    }
  };

  const handleChange = (e: any) => {
    setEmail(e.target.value);
  };

  return (
    <Layout>
      <div className="p-16 flex justify-center min-h-screen bg-[#FCFdf7]">
        <div className="space-y-4 w-1/2 bg-white border-2 border-black p-4 shadow-nb rounded-lg h-full">
          <h1 className="text-3xl font-bold text-center">Invite User</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email:
              </label>
              <input
                className="mt-1 px-2 py-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-gray-700"
                name="email"
                type="email"
                value={email}
                onChange={handleChange}
                placeholder="Enter email"
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
