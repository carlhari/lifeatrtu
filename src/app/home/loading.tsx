export default function Loading() {
  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center outline-none">
      <span className="loading loading-spinner w-20"></span>
      <img
        src="/landingbg.png"
        alt="image"
        loading="lazy"
        className="absolute top-0 left-0 w-full h-full bg-cover z-10"
      />
    </div>
  );
}
