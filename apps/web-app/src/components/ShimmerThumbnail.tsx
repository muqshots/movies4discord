const ShimmerThumbnail = () => {
  return (
    <a className="snap-start">
      <div className="flex animate-pulse flex-col gap-2">
        <div
          className="shadow-darktheme aspect-video w-[244px] shrink-0 rounded-lg border-2 border-transparent bg-slate-800 shadow-md transition duration-200 hover:scale-105 hover:border-white hover:shadow-white md:w-[324px]" // Add 4px to 16:9 w:h for borders
        ></div>
        <div className="pointer-events-none flex w-60 select-none flex-row justify-between rounded-lg bg-slate-800 md:w-80">
          <div>&nbsp;</div>
          <div>&nbsp;</div>
        </div>
      </div>
    </a>
  );
};

export default ShimmerThumbnail;
