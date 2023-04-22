import { useEffect, useState } from 'react';

const VideoError = () => {
  const [mediaPage, setMediaPage] = useState('');
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const mediaPage = searchParams.get('mediaPage');
    const errorTextParam = searchParams.get('errorText');
    setMediaPage(mediaPage || '');
    setErrorText(errorTextParam || '');
    console.error(`Error loading video from ${mediaPage}: ${errorText}`);
  }, []);

  return (
    <>
      <div className="flex w-auto flex-col items-center md:ml-5 overflow-x-hidden">
        <img src="/error.png" alt="User raging about the site being bad" className="w-5/6 md:w-3/4 lg-w-1/2 mt-6 mb-4" />
        <h1 className="text-2xl md:text-4xl font-bold text-red-500 my-8 mt-10">Problem loading stream</h1>
        <div className="w-3/4 md:w-5/6 flex flex-col items-center justify-center">
          <p className="text-l text-center">
            Error: {errorText}
          </p>
          <p className="text-l text-center">
            Open a ticket on our Discord if this keeps happening.
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