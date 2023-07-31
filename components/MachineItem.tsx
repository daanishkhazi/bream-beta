import { Machine } from "@/types/dbTypes";

type MachineItemProps = {
  machine: Machine;
};

const MachineItem: React.FC<MachineItemProps> = ({ machine }) => {
  return (
    <div className="flex justify-between items-start bg-white border-black border-2 shadow-nb p-4 mb-4 rounded hover:scale-[101%] transition ease-in-out delay-50">
      <div className="flex flex-col">
        <h3 className="text-lg font-bold">{machine.name}</h3>
        <p className="text-sm text-gray-600">{machine.description}</p>
      </div>
      <div
        className={`h-3 w-3 rounded-full ${
          machine.isActive ? "bg-green-500" : "bg-red-500"
        }`}
        title={machine.isActive ? "Active" : "Inactive"}
      />
    </div>
  );
};

export default MachineItem;
