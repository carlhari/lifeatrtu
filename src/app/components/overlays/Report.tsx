import Button from "@/app/components/Button";
import { isOpenReport } from "@/utils/Overlay/Report";
import { useState } from "react";
import { IoClose } from "react-icons/io5";

let reports = [
  "Hate Speech",
  "Spam",
  "False Information",
  "Suicidal or Self Injury",
  "Harrasment",
  "Violence",
  "Nudity",
  "Something Else",
];

function Report({ reload }: any) {
  const [report, setReport] = useState<string>("");
  const Report = isOpenReport();
  return (
    <div className="fixed top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center animate-fadeIn duration-700 z-50 bg-slate-500/60">
      <div className="bg-white w-1/3 p-4 flex items-center flex-col rounded-xl gap-4">
        <div className="w-full flex items-center justify-end">
          <button
            type="button"
            className="text-3xl"
            onClick={() => {
              setReport("");
              Report.close();
            }}
          >
            <IoClose />
          </button>
        </div>

        <div>
          <div>Please Select a problem</div>
          <div>
            If someone is in immediate danger, get help before reporting to
            admins. Don't Wait.
          </div>
        </div>

        <form className="w-full flex flex-col items-start justify-center gap-2">
          {reports.map((item, key) => {
            return (
              <button
                key={key}
                onClick={() => {
                  setReport(item.toLowerCase());
                }}
                type="button"
                className={`font-semibold text-lg w-full flex items-center justify-start rounded-xl px-4 ${
                  report === item.toLowerCase() && "bg-slate-200"
                }`}
              >
                {item}
              </button>
            );
          })}
        </form>
      </div>
    </div>
  );
}

export default Report;
