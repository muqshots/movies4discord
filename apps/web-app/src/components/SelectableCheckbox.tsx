import { MdCheckCircleOutline } from "react-icons/md";

type SelectableCheckboxProps = {
  item: {
    id: number;
    name: string;
  };
  selected: boolean;
  onClick?: () => void;
};

const SelectableCheckbox = ({ item, selected, onClick }: SelectableCheckboxProps) => {

  return (
    <button
      className={`flex flex-row justify-center text-sm items-center px-2 py-1 rounded-lg focus:outline-none ${
        selected
          ? "bg-white text-gray-900 hover:bg-graything hover:text-white"
          : "bg-graything text-white hover:bg-white hover:text-gray-900"
        } transition duration-200`}
      onClick={onClick}
    >
      {item.name}
      <input
        type="checkbox"
        className="hidden"
        checked={selected}
        onChange={() => undefined}
      />
      {selected ? (
        <MdCheckCircleOutline className="ml-1 h-3 w-3 my-auto" />
      ) : null}
    </button>
  );
};

export default SelectableCheckbox;
  