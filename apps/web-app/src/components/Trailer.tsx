interface TrailerProps {
  ytKey: string;
  onClose: () => void;
}

const Trailer = ({ onClose, ytKey }: TrailerProps) => {
  return (
    <div className={`fixed inset-0 z-[60]`}>
      <div
        className={`fixed h-screen w-screen bg-black/75`}
        onClick={onClose}
      ></div>

      <div className="flex h-screen items-center justify-center">
        <div className="flex w-4/5 flex-col">
          <iframe
            title="Media trailer"
            src={`https://www.youtube.com/embed/${
              ytKey ||
              // lmao get rekt
              "dQw4w9WgXcQ"
            }?vq=hd1080&autoplay=1`}
            frameBorder="0"
            allowFullScreen
            className="z-[100] aspect-video w-full rounded-xl"
            allow="autoplay"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Trailer;
