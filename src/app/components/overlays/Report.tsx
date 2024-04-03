"use client";
import { isOpenReport, valueReport } from "@/utils/Overlay/Report";
import axios from "axios";
import { ChangeEvent, useRef, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";

let reports = [
  "Hate Speech",
  "Spam",
  "False Information",
  "Suicidal or Self Injury",
  "Harassment",
  "Violence",
  "Nudity",
  "Something Else",
];

function Report({ reload }: any) {
  const [reportCategory, setReportCategory] = useState<string[]>([]);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [isDisabledBtn, setDisabledBTN] = useState<boolean>(false);
  const controllerRef = useRef(new AbortController());
  const Report = isOpenReport();
  const reportValue = valueReport();

  let status = ["BUSY", "UNAUTHORIZED", "NEGATIVE", "ERROR", "FAILED"];

  const handleSubmit = (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (disabled) {
      toast.error("Please Wait");
    }

    setDisabledBTN(true);
    const loadingId = toast.loading("Reporting...");
    const { signal } = controllerRef.current;

    setTimeout(() => {
      setDisabled(true);
      axios
        .post(
          "/api/post/actions/report",
          {
            postId: reportValue.id,
            reason: reportCategory,
          },
          { signal: signal }
        )
        .then((response) => {
          if (response.data.ok) {
            Report.close();
            toast.success(response.data.msg);
          } else {
            Report.close();
            toast.error(`Failed: ${response.data.msg}`);
          }
        })
        .catch((err) => {
          if (err.name === "CanceledError") {
            toast.error("Canceled");
          }
          toast.error("Error Occurred");
        })
        .finally(() => {
          toast.dismiss(loadingId);
          setDisabled(false);
          setDisabledBTN(false);
        });
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      if (reportCategory.length < 3) {
        setReportCategory((prevCategories) => [...prevCategories, value]);
      } else {
        e.target.checked = false;
      }
    } else {
      setReportCategory((prevCategories) =>
        prevCategories.filter((category) => category !== value)
      );
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center animate-fadeIn duration-700 z-50 bg-slate-500/60">
      <div className="bg-white w-1/3 p-2 flex items-center flex-col rounded-xl gap-4 2xl:w-5/12 lg:w-7/12 md:w-10/12  xs:w-full xs:h-full xs:rounded-none xs:p-3">
        <div className="w-full flex items-center justify-between">
          <div className={`w-1/3 ${disabled && "hidden"}`}></div>

          <div
            className={`uppercase text-2xl font-semibold flex items-center justify-center ${disabled ? "w-full" : "w-1/3"}`}
          >
            Report
          </div>
          <button
            type="button"
            className={`text-3xl w-1/3 flex items-center justify-end ${disabled && "hidden"}`}
            onClick={() => {
              controllerRef.current.abort();
              setReportCategory([]);
              Report.close();
            }}
            disabled={disabled}
          >
            <IoClose />
          </button>
        </div>

        <div className="w-full">
          <div className="text-xl">Please Select a problem</div>
          <div className="text-sm">
            If someone is in immediate danger, get help before reporting to
            admins. {"Don't"} Wait.
          </div>
        </div>

        <form
          className="w-full flex flex-col items-start justify-center gap-2"
          onSubmit={handleSubmit}
        >
          {reports.map((item, key) => (
            <div key={key} className="w-11/12 m-auto">
              <label className="font-semibold text-lg w-full flex items-center justify-start rounded-xl px-4 gap-1">
                <input
                  type="checkbox"
                  value={item.toLowerCase()}
                  checked={reportCategory.includes(item.toLowerCase())}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                {item}
              </label>
            </div>
          ))}

          <div className="w-full flex items-center justify-center">
            <button
              type="submit"
              className={`bg-blue-800 uppercase text-base text-white rounded-xl px-2 ${disabled || isDisabledBtn ? "cursor-not-allowed" : "cursor-pointer"}`}
              disabled={disabled || isDisabledBtn}
            >
              SUBMIT
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
          Our admins & moderators will investigate this feedback. Thank you.
        </div>
        <div className="text-base pt-6">We Care About What You Think.</div>
      </div>
    </div>
  );
}

export default Report;
