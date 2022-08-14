import Link from "next/link";
import { useRouter } from "next/router";

const AsicNavbar = () => {
  const router = useRouter();

  return (
    <div className="w-full p-5 flex flex-row justify-start items-center">
      <div className="flex flex-row justify-start items-center">
        <h1 className="xl:text-4xl text-2xl font-extrabold text-[#ffffff]">
          {router.pathname === "/" ? (
            "ASIC Tools"
          ) : (
            <Link href={"/"}>ASIC Tools</Link>
          )}
        </h1>
      </div>
    </div>
  );
};

export default AsicNavbar;
