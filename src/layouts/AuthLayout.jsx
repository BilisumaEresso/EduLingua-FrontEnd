import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageDropdown from "../components/LanguageDropdown";

const AuthLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex text-slate-900 dark:text-slate-50 bg-slate-50 dark:bg-slate-950">
      {/* Left side Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Top row: logo + language switcher */}
          <div className="mb-8 hidden lg:flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400"
            >
              <img
                className="h-12 w-auto"
                src="/logo.png"
                alt="EduLingua Logo"
              />
              <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
                EduLingua
              </span>
            </Link>
            <LanguageDropdown />
          </div>

          {/* Mobile language switcher */}
          <div className="lg:hidden flex justify-end mb-4 mt-4">
            <LanguageDropdown />
          </div>

          <Outlet />
        </div>
      </div>

      {/* Right side Image / Graphic */}
      <div className="relative hidden w-0 flex-1 lg:block relative z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-600 to-fuchsia-700"></div>
        {/* Decorative elements */}
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-white/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-indigo-500/20 blur-3xl rounded-full"></div>

        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md text-white/90">
            <h2 className="text-4xl font-bold mb-6 tracking-tight">
              {t("general.masterLanguages")}
            </h2>
            <p className="text-lg text-white/80 leading-relaxed">
              {t("general.joinThousands")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
