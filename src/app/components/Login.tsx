"use client";
import LoginButton from "@/app/components/LoginButton";
import { useEffect, useState } from "react";
import BrowserDetector from "browser-dtector";

function Login() {
  const [isSupported, setSupported] = useState<boolean>(false);
  const [hydrate, setHydrate] = useState<boolean>(false);

  useEffect(() => {
    const supportedBrowsers = [
      "google chrome",
      "edg",
      "firefox",
      "safari",
      "brave",
      "opera",
      "microsoft edge",
    ];
    const browser = new BrowserDetector(window.navigator.userAgent);
    const value = browser.getBrowserInfo();

    if (supportedBrowsers.includes(value.name.toLowerCase())) {
      setSupported(true);
    }
  }, []);

  useEffect(() => {
    setHydrate(true);
  }, []);

  return hydrate && isSupported ? (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center outline-none">
      <div className="bg-white shadow-xl p-4 z-50 w-4/12 flex flex-col items-center justify-center rounded-2xl lg:w-8/12 md:w-9/12 sm:w-11/12">
        <div className="flex items-center justify-center w-full h-full flex-wrap">
          <div className="text-8xl xs:text-7xl">Life@</div>
          <div
            style={{
              backgroundImage: "url('/textbg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="text-img font-extrabold text-center bg-clip-text text-transparent text-9xl xs:text-8xl"
          >
            RTU
          </div>
        </div>

        <div className="flex items-center flex-col gap-4">
          <div className="tagline flex items-center gap-4 text-4xl text-transparent">
            Your <p className="voice text-slate-600 shadow-none">VOICE</p>
            Matters
          </div>
          <div className="italic text-center">
            We make it easier to share your thoughts about the campus
          </div>
          <LoginButton />
        </div>
      </div>

      <img
        src="/landingbg.png"
        alt="image"
        loading="lazy"
        className="image absolute top-0 left-0 w-full h-full bg-cover z-10"
      />
    </div>
  ) : (
    hydrate && (
      <div className="w-full h-screen flex items-center justify-center text-2xl">
        Browser Not Supported, Please use Modern Browsers.
      </div>
    )
  );
}

export default Login;
