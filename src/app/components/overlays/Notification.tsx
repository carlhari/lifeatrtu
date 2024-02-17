import React from "react";
import axios from "axios";
import { useRequest } from "ahooks";

function Notification() {
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

  const { data, loading, mutate } = useRequest(() => getNotif());

  const resData = data as any;

  console.log(resData);
  return (
    <div className="absolute top-2 right-24 animate-fadeIn duration-500 z-40">
      <div className="w-96 bg-slate-400 max-h-96 p-3 rounded-2xl">
        <div className="w-full text-center text-white">Notification</div>
        <div className="w-full h-full bg-white rounded-lg px-1">
          {/* {resData &&
            resData.ok &&
            resData.notifs.map((item: any, key: any) => {
              return (
                item && (
                  <div key={key}>
                    {item.id} {item.type} your post {item.postId}
                  </div>
                )
              );
            })} */}
        </div>
      </div>
    </div>
  );
}

export default Notification;
