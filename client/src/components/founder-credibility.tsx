import { SiLinkedin } from "react-icons/si";
import { ArrowRight } from "lucide-react";

const JAMIE_PHOTO =
  "https://media.licdn.com/dms/image/v2/D4E03AQHHmyaMTgwJSg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1667558672803?e=1790812800&v=beta&t=mIUDgECtD9tYPTdNiNmryyjCvQqdl9ZnFDAs1v5wLRU";

export default function FounderCredibility() {
  return (
    <section className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-10">

          {/* Photo */}
          <div className="flex-shrink-0">
            <img
              src={JAMIE_PHOTO}
              alt="Jamie Irwin — The Reddit SEO"
              width={120}
              height={120}
              className="w-28 h-28 rounded-full object-cover ring-4 ring-gray-100"
            />
          </div>

          {/* Text */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-500 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                The Reddit SEO
              </span>
              <span className="text-xs text-gray-400 font-medium">1,650+ cases resolved</span>
            </div>

            <h2 className="font-satoshi text-2xl font-black text-gray-950 tracking-[-0.03em] mb-3">
              Jamie Irwin
            </h2>

            <p className="text-gray-500 leading-relaxed max-w-2xl mb-5">
              Jamie Irwin has spent years mastering Reddit's content policies, removal processes, and
              reputation dynamics. As the person behind 1,650+ successful case resolutions, he's the
              UK's leading specialist in Reddit reputation management. When your post needs to
              disappear, Jamie's the one who makes it happen.
            </p>

            <a
              href="https://www.linkedin.com/in/jamieirwin/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#0A66C2] transition-colors"
            >
              <SiLinkedin className="w-4 h-4 text-[#0A66C2]" />
              Connect on LinkedIn
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
