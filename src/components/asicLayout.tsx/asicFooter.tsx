import Image from "next/image";
import Link from "next/link";
import GitHubLogo from "../../public/images/github.png";
import twitterLogo from "../../public/images/twitter.png";

const AsicFooter = () => {
  return (
    <div className="w-full p-5 flex flex-row justify-center items-center  gap-52 bg-slate-900">
      <div className="flex flex-col justify-center items-center text-white">
        <div className="flex flex-row gap-4">
          <Link href="https://twitter.com/AdrenaIine">
            <a className="text-white" target="_blank">
              <Image
                src={twitterLogo}
                alt="twitter logo"
                width={32}
                height={32}
              />
            </a>
          </Link>
          <Link href="https://github.com/nhamilton1">
            <a className="text-white" target="_blank">
              <Image
                src={GitHubLogo}
                alt="github logo"
                width={32}
                height={32}
              />
            </a>
          </Link>
        </div>
        <p>Made by Nick</p>
      </div>
    </div>
  );
};

export default AsicFooter;
