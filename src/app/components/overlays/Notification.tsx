import React from "react";
import axios from "axios";
import { useRequest } from "ahooks";
import { useSession } from "next-auth/react";

function Notification() {
  const { data: session } = useSession();

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
    <div className="absolute top-2 right-24 animate-fadeIn duration-500 z-40">
      <div className="w-96 bg-slate-400 max-h-96 p-3 rounded-2xl">
        <div className="w-full text-center text-white">Notification</div>
        <div className="w-full h-full bg-white rounded-lg px-1">
          {loading && <div>Loading...</div>}
          {!loading &&
            resData &&
            resData.ok &&
            resData.notifs.map((item: any, key: any) => (
              <div key={key}>
                {item.type === "like" ? (
                  <div>
                    {item.user.name} {item.type} your post, Entitled "
                    {item.post.title}"
                  </div>
                ) : (
                  <div>
                    {item.user.name} Commented on your post, Entitled "
                    {item.post.title}"
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
