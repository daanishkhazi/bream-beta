import Link from "next/link";
import Image from "next/image";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useState, useEffect } from "react";

async function fetchUserRole(auth0Id: string) {
  const response = await fetch(`/api/role/${auth0Id}`, {
    method: "GET",
    credentials: "include",
  });
  const data = await response.json();
  return data.role;
}

export default function Header() {
  const { user, error, isLoading } = useUser();
  const [role, setRole] = useState(null);
  useEffect(() => {
    if (!isLoading && user && user.sub) {
      fetchUserRole(user.sub).then((role) => setRole(role));
    }
  }, [user, isLoading]);
  return (
    <nav className="flex items-center justify-between px-4 py-2 bg-[#FCFDF7] border-b-4 border-black">
      <div>
        <Link href="/">
          <Image src="/logo.svg" alt="Logo" width={200} height={150} />
        </Link>
      </div>
      <div className="flex items-center space-x-4 font-medium">
        <Link
          href="/"
          className="transition-colors duration-200 text-gray-900 hover:text-gray-900 hover:underline"
        >
          Home
        </Link>
        {role === "ADMIN" && (
          <Link
            href="/admin"
            className="transition-colors duration-200 text-gray-900 hover:text-gray-900 hover:underline"
          >
            Admin
          </Link>
        )}
        {user ? (
          <button>
            <a
              href="/api/auth/logout"
              className="transition-colors duration-200 text-gray-900 border-2 border-black py-1 px-2 hover:bg-black hover:text-white"
            >
              Logout
            </a>
          </button>
        ) : (
          <button>
            <a
              href="/api/auth/login"
              className="transition-colors duration-200 text-gray-900 hover:text-gray-900"
            >
              Login
            </a>
          </button>
        )}
      </div>
    </nav>
  );
}
