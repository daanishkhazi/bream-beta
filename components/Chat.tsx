import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Job, ChatMachine } from "@/types/dbTypes";

interface ChatProps {
  machines: ChatMachine[];
}

interface Message {
  role: string;
  content: string;
}

export default function Chat({ machines }: ChatProps) {
  const [selectedMachine, setSelectedMachine] = useState<ChatMachine | null>(
    null
  );
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages]);

  useEffect(() => {
    // Find first machine with jobs
    const machineWithJobs = machines.find((machine) => machine.jobs.length > 0);
    if (machineWithJobs) {
      setSelectedMachine(machineWithJobs);
      setSelectedJob(machineWithJobs.jobs[0]);
    } else {
      setSelectedMachine(machines[0]);
    }
  }, [machines]);

  useEffect(() => {
    console.log("updated messages", messages);
  }, [messages]);

  useEffect(() => {
    // Check if both selectedMachine and selectedJob exist
    if (selectedMachine && selectedJob) {
      const systemMessage: Message = {
        role: "system",
        content: `You are an adept CNC machinist AI with deep knowledge of machining and G-code programming. Your job: assisting with tool selection, material handling, G-code tweaks, problem diagnosis, process enhancement, and safety measures. Aim for responses that are concise, instructive, and supportive, fitting the skill level of the inquirer. Since you are an AI assistant, you will only give suggestions and, in cases you deem important or necessary to do, recommend escalating the issue to a supervisor or senior machinist. Avoid flowery language or unnecessary pontification.

        You're currently manning the ${selectedMachine.name}, characterized by ${selectedMachine.description}. What to know: ${selectedMachine.generalNotes}. Maintenance specifics: ${selectedMachine.maintenanceNotes}.
        
        You're executing the job: ${selectedJob.name}, on part ${selectedJob.part}, involving ${selectedJob.description}. Tooling and setup guidelines (remember that the asker should have a setup sheet with all the tooling detailed, so don't list off tools required): ${selectedJob.setupNotes}. Operation and safety insights: ${selectedJob.operationNotes}. Quality and inspection notes: ${selectedJob.qualityNotes}`,
      };

      // Reset the messages array to just the new system message
      setMessages([systemMessage]);
    }
  }, [selectedMachine, selectedJob]);

  const handleMachineChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const machine = machines.find(
      (machine) => machine.id === event.target.value
    );
    if (machine) {
      setSelectedMachine(machine);
      setSelectedJob(machine.jobs.length > 0 ? machine.jobs[0] : null);
    }
  };

  const handleJobChange = (jobId: string) => {
    if (!selectedMachine) return;
    const job = selectedMachine.jobs.find((job) => job.id === jobId);
    if (job) {
      setSelectedJob(job);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSendMessage = async () => {
    // create a user message
    const userMessage: Message = {
      role: "user",
      content:
        "Please answer the following in a concise and tactical way. If you are going to list out options, list out no more 3: " +
        input,
    };

    // append user message to messages and get updated messages
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsSending(true);
    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: updatedMessages,
        machine: selectedMachine?.id,
        job: selectedJob?.id,
      }),
    });
    setIsSending(false);
    if (response.ok) {
      const responseData = await response.json();
      const assistantMessage: Message = {
        role: responseData.role,
        content: responseData.content,
      };

      // append assistant message to messages
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } else {
      // handle error
      console.error("Failed to send message");
    }
  };

  if (!selectedMachine) return <div>No machines available</div>;

  return (
    <div className="flex w-full h-[44rem] bg-[#fcfdf7] p-4 px-16">
      <div className="flex flex-col w-1/4 h-full bg-white border-black border-2 shadow-nb p-4 mb-4 rounded overflow-y-auto">
        {selectedMachine?.jobs.map((job) => (
          <button
            key={job.id}
            onClick={() => handleJobChange(job.id)}
            className={`py-2 px-4 mb-2 rounded text-left border-2 border-black shadow-nb-small hover:scale-[103%] transition ease-in-out delay-50 ${
              selectedJob?.id === job.id ? "bg-gray-200 font-bold" : "bg-white"
            }`}
          >
            {job.name}
          </button>
        ))}
      </div>
      <div className="flex flex-col w-3/4 h-full ml-4">
        <div className="p-4 w-full h-[4rem] bg-white border-black border-2 shadow-nb rounded cursor-pointer font-bold hover:scale-[101%] transition ease-in-out delay-50">
          <select
            value={selectedMachine.id}
            onChange={handleMachineChange}
            className="w-full h-full cursor-pointer focus:outline-none"
          >
            {machines.map((machine) => (
              <option key={machine.id} value={machine.id}>
                {machine.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col justify-between h-[37rem] p-4 bg-white border-black border-2 shadow-nb rounded mt-4">
          <div className="overflow-auto flex-grow">
            {messages.slice(1).map((message, index) => (
              <div
                key={
                  message.content
                    ? `${message.content.substring(0, 5)}-${index}`
                    : index
                }
                className={`p-2 mb-2 rounded-lg ${
                  message.role === "assistant" ? "bg-gray-100" : "bg-white"
                }`}
              >
                {message.role === "user"
                  ? message.content
                      .replace(
                        "Please answer the following in a concise and tactical way. If you are going to list out options, list out no more 3: ",
                        ""
                      )
                      .split("\n")
                      .filter((item) => item)
                      .map((item, key) => {
                        return <p key={key}>{item}</p>;
                      })
                  : message.content
                      .split("\n")
                      .filter((item) => item)
                      .map((item, key) => {
                        return <p key={key}>{item}</p>;
                      })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t-2 border-gray-400 p-2 flex mt-4">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                  e.preventDefault(); // This will prevent the newline addition in case of textarea or form submission in case of form
                }
              }}
              className="w-full rounded border-2 border-black p-2 focus:outline-none"
              placeholder="Type your message..."
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 px-4 bg-white rounded border-black border-2 shadow-nb-small rounded hover:scale-[101%] transition ease-in-out delay-50"
            >
              {isSending ? (
                <Image
                  src="/icon.svg"
                  alt="spinner"
                  className="spin"
                  width={30}
                  height={30}
                />
              ) : (
                "Send"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
