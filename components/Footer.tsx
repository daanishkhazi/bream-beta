import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex items-center justify-between p-6 border-t-4  border-black bg-[#FCFDF7]">
      <div className="font-medium">© 2023 Bream Labs, Inc.</div>
      <div className="flex items-center space-x-4">
        {/* <Link href="/help">Help</Link> */}
        <Link href="https://www.trybream.com/privacy">Privacy</Link>
        <Link href="https://www.trybream.com/terms">Terms</Link>
      </div>
    </footer>
  );
}
