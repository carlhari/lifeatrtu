"use client";
import { isOpenReport, valueReport } from "@/utils/Overlay/Report";
import axios from "axios";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import Button from "../Button";
import { useRequest } from "ahooks";
import { useSession } from "next-auth/react";

function Report({ reload }: any) {
  const { data: session } = useSession();
  const [disabled, setDisabled] = useState<boolean>(false);
  const [isDisabledBtn, setDisabledBTN] = useState<boolean>(false);
  const controllerRef = useRef(new AbortController());

  const Report = isOpenReport();
  const reportValue = valueReport();

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();
    return () => controllerRef.current?.abort();
  }, [session]);

  const getTitle = async () => {
    try {
      const response = await axios.post("/api/post/actions/report/get", {
        postId: reportValue.id,
      });

      const data = response.data;

      if (data.ok) {
        return data.title;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const { data, loading } = useRequest(getTitle, { refreshDeps: [session] });

  const handleReport = () => {
    if (disabled) {
      toast.error("Please Wait");
    }

    const loadingId = toast.loading("Reporting...");
    const { signal } = controllerRef.current;

    setDisabled(true);

    setTimeout(() => {
      setDisabledBTN(true);
      axios
        .post(
          "/api/post/actions/report",
          { postId: reportValue.id },
          { signal: signal }
        )
        .then((response) => {
          const data = response.data;
          if (data.ok) {
            toast.success("Reported Successfully");
            Report.close();
          } else {
            toast.error("Failed To Report the Post");
          }
        })
        .catch((err) => {
          if (err.name === "CanceledError") {
            toast.error("Canceled");
          }
          toast.error("Error Occurred");
        })
        .finally(() => {
          reload();
          toast.dismiss(loadingId);
          setDisabled(false);
          setDisabledBTN(false);
        });
    }, 500);
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
              reportValue.clear();
              Report.close();
            }}
            disabled={disabled}
          >
            <IoClose />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <p className="text-2xl text-center">
            Are you sure you want to{" "}
            <strong className="uppercase text-red-600">report</strong> this post
            ?
          </p>
          {loading && <span className="loading loading-dots w-10"></span>}
          {!loading && data && <div className="text-2xl">Entitled: {data}</div>}

          <div className="flex gap-6 items-center">
            <Button
              label={"Yes"}
              type="button"
              className={`${isDisabledBtn ? "cursor-not-allowed" : "cursor-pointer"} p-1 px-3 rounded-xl text-xl sm:text-lg bg-green-600 text-white hover:scale-125 duration-500`}
              onClick={handleReport}
              disabled={isDisabledBtn || disabled}
            />

            <Button
              label={"No"}
              type="button"
              className={`${isDisabledBtn && "hidden"} p-1 px-3 rounded-xl text-xl sm:text-lg bg-red-600 text-white hover:scale-125 duration-500`}
              onClick={() => {
                Report.close();
                reportValue.clear();
              }}
              disabled={isDisabledBtn || disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;
