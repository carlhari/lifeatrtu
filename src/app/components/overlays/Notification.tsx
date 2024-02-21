import React from "react";
import axios from "axios";
import { useRequest } from "ahooks";
import { useSession } from "next-auth/react";

function Notification() {
  const { data: session, status } = useSession();

  function getNotif() {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post("/api/post/get/notif");
        const data = response.data;
        if (data.ok) {
          return resolve(data);
        }
        return reject();
      } catch (err) {
        console.error(err);
      }
    });
  }

  const { data, loading, mutate } = useRequest(() => getNotif(), {
    refreshDeps: [session],
  });

  const resData = data as any;

  return (
    <div className="absolute top-2 right-24 animate-fadeIn duration-500 z-40 sm:right-16 xxs:right-14">
      <div className="w-96 bg-slate-400 max-h-96 p-2 rounded-2xl xs:w-80 xs:p-2 xs:rounded-lg xxs:w-64">
        <div className="w-full text-center text-white">Notification</div>
        <div className="w-full h-full bg-white rounded-md px-1 flex items-center justify-center flex-col">
          {loading && (
            <span className="loading loading-dots w-16 xxs:w-12"></span>
          )}
          {!loading &&
            resData &&
            resData.ok &&
            resData.notifs.map((item: any, key: any) => (
              <div
                key={key}
                className="border-solid border-black border-opacity-5 w-full"
              >
                {item.type === "like" ? (
                  <div className="w-full font-semibold xxs:text-sm">
                    {item.user.name} {item.type} your post, Entitled "
                    {item.post.title}"<br></br>
                    <hr
                      className="border-t border-solid border-black"
                      style={{ opacity: 0.25 }}
                    ></hr>
                  </div>
                ) : (
                  <div className="w-full font-semibold xxs:text-sm">
                    {item.user.name} Commented on your post, Entitled "
                    {item.post.title}"<br></br>
                    <hr
                      className="border-t border-solid border-black"
                      style={{ opacity: 0.25 }}
                    ></hr>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Notification;
