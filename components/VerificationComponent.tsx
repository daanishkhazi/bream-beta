import { useState } from "react";

export default function VerificationComponent() {
  const [code, setCode] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const res = await fetch("/api/verifyUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (res.ok) {
      location.reload();
    } else {
      alert("Verification failed, please try again.");
    }
  };

  return (
    <div className="space-y-4 w-1/2 bg-white border-2 border-black p-4 shadow-nb rounded-lg h-full">
      <h1 className="text-3xl font-bold text-center">Verification Required</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700">
            Please enter your verification code to use Bream
          </label>
          <form onSubmit={handleSubmit} className="mt-1">
            <input
              className="mt-1 px-2 py-1 block w-full rounded-md border-2 border-gray-700 shadow-sm focus:border-gray-700"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
            />
            <div className="mt-4">
              <button
                type="submit"
                className="py-1 px-2 bg-green-700 rounded font-semibold border-black text-white border-2 shadow-nb-small hover:scale-[101%] transition ease-in-out delay-50"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
