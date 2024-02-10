export default function Loading() {
  return (
    <div className="relative w-full h-screen overflow-hidden flex items-center justify-center outline-none">
      <div className="flex items-center flex-col justify-center">
        <span className="loading loading-spinner w-20 z-50"></span>
        <div className="text-2xl">Loading</div>
      </div>
      <img
        src="/landingbg.png"
        alt="image"
        loading="lazy"
        className="absolute top-0 left-0 w-full h-full bg-cover"
      />
    </div>
  );
}
