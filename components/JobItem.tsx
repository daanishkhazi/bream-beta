import { Job } from "@/types/dbTypes";

type JobItemProps = {
  job: Job;
};

const JobItem: React.FC<JobItemProps> = ({ job }) => {
  return (
    <div className="flex justify-between items-start bg-white border-black border-2 shadow-nb p-4 mb-4 rounded hover:scale-[101%] transition ease-in-out delay-50">
      <div className="flex flex-col">
        <h3 className="text-lg font-bold">{`${job.name} - ${job.part}`}</h3>
        <p className="text-sm text-gray-600">{job.description}</p>
      </div>
      <div
        className={`h-3 w-3 rounded-full ${
          job.isActive ? "bg-green-500" : "bg-red-500"
        }`}
        title={job.isActive ? "Active" : "Inactive"}
      />
    </div>
  );
};

export default JobItem;
