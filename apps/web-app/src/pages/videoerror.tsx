import Image from "next/image";
import errorImage from "../../public/error.png";

const VideoError = () => {

  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : "Unknown";
  const browser = userAgent.includes("Firefox") && !userAgent.includes("Seamonkey") ? "Firefox" : userAgent.search("Chrome") && !userAgent.includes("Chromium") && !userAgent.includes("Edg") ? "Chrome" : userAgent.includes("Edg") ? "Edge" : userAgent.search("Safari") && !userAgent.includes("Chromium") && !userAgent.includes("Chrome") ? "Safari" : userAgent.includes("OPR") || userAgent.includes("Opera") ? "Opera" : "Chromium"
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window?.location.search : "");
  const mediaPage = searchParams.get('mediaPage');
  const errorText = searchParams.get('errorText');
  const titleText = searchParams.get('mediaTitle');
  const seasonParam = searchParams.get('season');
  const episodeParam = searchParams.get('episode');
  const seasonText = seasonParam ? `S${seasonParam}E${episodeParam}` : '';
  const server = searchParams.get('server');
  if (typeof window !== 'undefined') {
    console.error(`Error loading video from ${mediaPage}: ${errorText}`);
  }

  return (
    <>
      <div className="flex w-auto flex-col items-center md:ml-5 overflow-x-hidden">
        <Image
          src={errorImage}
          alt="User raging about the site being bad"
          className="w-5/6 md:w-2/3 lg-w-1/2 mt-6 mb-4"
        />
        <h1 className="text-2xl md:text-4xl font-bold text-red-500 mb-8 mt-4">Problem loading stream</h1>
        <div className="w-3/4 md:w-5/6 flex flex-col items-center justify-center">
          <p className="text-l text-center mb-5 w-auto rounded-xl bg-gray-800 text-white p-10">
            Open a ticket on our Discord with the following information if this keeps happening: <br />
            Browser: {browser} <br />
            Title: {titleText} {seasonText} <br />
            Server: {server} <br />
            Error: {errorText}
          </p>
        </div>
        {mediaPage && (
          <button
            type="button"
            className="bg-graything hover:bg-white hover:text-black text-white transition duration-200 font-bold py-2 px-4 rounded mt-6"
            onClick={() => {
              window.location.replace(mediaPage);
            }}
          >
            Back to media page
          </button>
        )}
      </div>
    </>
  );
};

export default VideoError;