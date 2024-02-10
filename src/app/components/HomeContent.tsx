"use client";
import React, { useEffect, useRef, useState } from "react";
import AddPost from "./overlays/AddPost";
import Form from "./Form";
import DisplayPost from "./DisplayPost";
import { useInfiniteScroll } from "ahooks";
import axios from "axios";
import { isOpenLogout } from "@/utils/Overlay/Logout";
import Logout from "@/app/components/overlays/Logout";
import { useSession } from "next-auth/react";
import { isOpenDelete } from "@/utils/Overlay/Delete";
import Delete from "@/app/components/overlays/Delete";
import { isOpenReport } from "@/utils/Overlay/Report";
import Report from "@/app/components/overlays/Report";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";

let status = ["BUSY", "UNAUTHORIZED", "NEGATIVE", "ERROR", "FAILED"];

function HomeContent() {
  const ref = useRef<HTMLDivElement>(null);
  const [keyword, setKeyword] = useState<boolean>(false);
  const [select, setSelect] = useState<string>("desc");

  const [postTime, setPostTime] = useState<number>(0);
  const [deleteTime, setDeleteTime] = useState<number>(0);
  const [editTime, setEditTime] = useState<number>(0);

  const { open } = isOpenLogout();
  const useDelete = isOpenDelete();
  const useReport = isOpenReport();
  const { data: session } = useSession();
  const router = useRouter();

  const getPosts = async (skip: any, take: number, order: any) => {
    try {
      const response = await axios.post("/api/post/get", {
        skip: skip,
        take: take,
        order: order,
      });

      const data = response.data;
      const newSkip = skip + take;

      if (!status.includes(data)) {
        return {
          list: data,
          skip: data && data.length < 10 ? undefined : newSkip,
        };
      } else {
        throw data;
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  const { data, mutate, loading, loadMore, noMore, loadingMore, reload } =
    useInfiniteScroll((d) => getPosts(d?.skip ? d?.skip : 0, 10, select), {
      target: ref,
      isNoMore: (d) => {
        if (d?.skip === undefined) return true;
        else return false;
      },
      reloadDeps: [keyword],
    });

  useEffect(() => {
    const handleFocus = () => {
      setKeyword(!keyword);
    };

    window.addEventListener("focus", handleFocus);

    reload();
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [keyword, select, session]);

  useEffect(() => {
    const checkUser = async () => {
      const response = await axios.post("/api/check/user");

      const data = response.data;

      if (!data.ok) {
        return router.push("/");
      }
    };

    checkUser();
  }, [session]);

  useEffect(() => {
    const getCD = async () => {
      try {
        const cd = await axios.post("/api/post/get/cooldown");

        const data = cd.data;

        if (data.ok) {
          setPostTime(data.postTime);
          setDeleteTime(data.deleteTime);
          setEditTime(data.editTime);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    };

    getCD();
  }, [session, keyword]);

  return (
    <div className="w-full h-full">
      {open && <Logout />}
      {useDelete.value && <Delete reload={reload} />}
      {useReport.value && <Report reload={reload} />}

      <AddPost />
      <Form
        data={data}
        mutate={mutate}
        noMore={noMore}
        loadMore={loadMore}
        setKeyword={setKeyword}
        keyword={keyword}
        postTime={postTime}
      />
      <div className="w-p-88 m-auto flex items-center justify-end">
        <div className="rounded-xl px-4 bg-white mb-2">
          <select
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelect(e.target.value)
            }
            defaultValue={"desc"}
            className="font-semibold text-xl bg-white"
          >
            <option value="desc">Recently</option>
            <option value="asc">Oldest</option>
            <option value="likes">Most Liked</option>
            <option value="engages">Most Engaged</option>
            <option value="comments">Most Commented</option>
          </select>
        </div>
      </div>

      {data && data.list.length === 0 ? (
        <div className="m-auto w-p-88 h-p-90 overflow-hidden flex items-center justify-start">
          <div className="-mt-20 text-8xl leading-snug font-semibold">
            We Care <br />
            about what <br />
            you think.
          </div>
        </div>
      ) : (
        <div ref={ref} className="m-auto w-p-88 h-p-90 overflow-y-auto">
          <DisplayPost
            data={data}
            loading={loading}
            loadMore={loadMore}
            loadingMore={loadingMore}
            mutate={mutate}
            setKeyword={setKeyword}
            keyword={keyword}
            noMore={noMore}
          />
        </div>
      )}
    </div>
  );
}

export default HomeContent;
