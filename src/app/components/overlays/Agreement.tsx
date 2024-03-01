import React, { Dispatch, SetStateAction } from "react";
import Button from "@/app/components/Button";
import { isOpenAgreement } from "@/utils/Overlay/Agreement";
import { BsIncognito, BsPatchCheck } from "react-icons/bs";
import type { FormType } from "@/types/form";

function Agreement({
  setStates,
  states,
}: {
  states: any;
  setStates: Dispatch<SetStateAction<FormType>>;
}) {
  const { agreementF } = isOpenAgreement();
  return (
    <div className="animate-fadeIn fixed top-0 left-0 w-full h-screen overflow-hidden bg-slate-600/50 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-5 bg-white w-5/12 rounded-xl p-4 md:p-2 lg:w-8/12 sm:w-11/12">
        <p className="text-2xl font-bold">Anonymous Post</p>
        <p className="text-lg md:text-base text-center sm:text-sm">
          Anonymous posts published in the website do not include your name
        </p>
        <div className="flex items-center gap-4 flex-col">
          {/* First paragraph */}
          <div className="flex items-center justify-start gap-5 w-10/12 full m-auto md:w-full md:gap-3">
            <div className="text-3xl sm:text-2xl">
              <BsIncognito />
            </div>
            <p className="text-justify sm:text-sm">
              Admins of the Life@RTU can see your name for satefy purposes.
            </p>
          </div>

          {/* SEcond paragraph */}
          <div className="flex items-center justify-start gap-5 w-10/12 m-auto md:w-full md:gap-3">
            <div className="text-3xl sm:text-2xl">
              <BsPatchCheck />
            </div>
            <p className="text-justify sm:text-sm">
              Admins and moderators may reach out to you personally once your
              feedback is highly alarming of someone's privacy or safety.
            </p>
          </div>
        </div>

        <Button
          label={"Agree"}
          type="button"
          className="rounded-lg px-3 text-lg text-white bg-blue-600"
          onClick={agreementF}
        />
      </div>
    </div>
  );
}

export default Agreement;
