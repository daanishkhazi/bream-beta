import Link from "next/link";

interface GreenButtonProps {
  href: string;
  text: string;
}

const GreenButton: React.FC<GreenButtonProps> = ({ href, text }) => {
  return (
    <Link href={href}>
      <button className="py-2 px-4 mt-4 bg-green-700 rounded font-semibold border-black text-white border-2 shadow-nb hover:scale-[103%] transition ease-in-out delay-50">
        {text}
      </button>
    </Link>
  );
};

export default GreenButton;
