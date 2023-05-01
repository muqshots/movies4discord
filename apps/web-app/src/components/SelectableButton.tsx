type SelectableButtonProps = {
  item: {
    id: number;
    name: string;
    url?: string;
  };
  media_type?: string;
  selected: boolean;
  onClick?: () => void;
}

const SelectableButton = ({ item, media_type, selected, onClick }: SelectableButtonProps) => {
  const handleClick = () => {
    if (item.url) {
      window.location.href = item.url;
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${
        selected ? "bg-white text-black" : "bg-graything text-white"
      } w-max rounded-md p-2 mx-1 text-xs transition duration-200 hover:bg-white hover:text-black focus:outline-none`}
    >
      {item.name}
    </button>
  );
};

export default SelectableButton;
