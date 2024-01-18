import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import LoginButton from "./components/LoginButton";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    return redirect("/home");
  }

  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center outline-none">
      <div className="card bg-base-100 shadow-xl p-8 z-50 w-4/12 flex flex-col items-center justify-center">
        <div className="flex items-center justify-center leading-normal">
          <div className="text-8xl">Life@</div>
          <div
            style={{
              backgroundImage: "url('/textbg.png')",
            }}
            className="text-img font-extrabold leading-relaxed  text-center bg-clip-text text-transparent text-9xl"
          >
            RTU
          </div>
        </div>

        <div className="flex items-center flex-col mb-2">
          <div className="tagline flex items-center gap-4 text-4xl text-transparent">
            Your <p className="voice text-slate-600 shadow-none">VOICE</p>
            Matters
          </div>
          <div className="italic">
            We make it easier to share your thoughts about the campus
          </div>
        </div>
        <LoginButton />
      </div>

      <img
        src="/landingbg.png"
        alt="image"
        loading="lazy"
        className="image absolute top-0 left-0 w-full h-full bg-cover z-10"
      />
    </div>
  );
}
