"use client";
import { useRef, useState } from "react";
import AddPost from "./overlays/AddPost";
import Form from "./Form";
import DisplayPost from "./DisplayPost";
import { useInfiniteScroll, useRequest } from "ahooks";
import axios from "axios";
import { isOpenLogout } from "@/utils/Overlay/Logout";
import Logout from "@/app/components/overlays/Logout";
import { signOut, useSession } from "next-auth/react";
import { isOpenDelete } from "@/utils/Overlay/Delete";
import Delete from "@/app/components/overlays/Delete";
import { isOpenReport } from "@/utils/Overlay/Report";
import Report from "@/app/components/overlays/Report";
import EditPost from "./overlays/EditPost";
import { isOpenEdit, valueEdit } from "@/utils/Overlay/EditPost";
import toast from "react-hot-toast";

let status = ["BUSY", "UNAUTHORIZED", "NEGATIVE", "ERROR", "FAILED"];

function HomeContent() {
  const ref = useRef<HTMLDivElement>(null);
  const [keyword, setKeyword] = useState<boolean>(false);
  const [select, setSelect] = useState<string>("desc");

  const { open } = isOpenLogout();
  const useDelete = isOpenDelete();
  const useReport = isOpenReport();

  const useEdit = isOpenEdit();
  const edit = valueEdit();

  const { data: session } = useSession();

  const getPosts = async (skip: any, take: number, order: any) => {
    try {
      const response = await axios.post("/api/post/get", {
        skip: skip,
        take: take,
        order: order,
      });

      const data = response.data;
      const newSkip = skip + take;

      if (status.includes(data)) {
        throw new Error("Failed to fetch posts: " + data);
      }

      return {
        list: data,
        skip: data && data.length < 10 ? undefined : newSkip,
      };
    } catch (err) {
      console.error("Error fetching posts:", err);
      throw err;
    }
  };

  const { data, mutate, loading, loadMore, noMore, loadingMore, reload } =
    useInfiniteScroll((d) => getPosts(d?.skip ? d?.skip : 0, 10, select), {
      target: ref,
      isNoMore: (d) => d?.skip === undefined,
      reloadDeps: [keyword, select, session],
    });

  const checkUser = async () => {
    try {
      const response = await axios.post("/api/check/user");

      const data = response.data;

      if (data.ok && data.msg === "ban") {
        toast.error("You are Banned");
        signOut({ callbackUrl: "/" });
      } else if (!data.ok && data.msg === "not") {
        toast.error("User Does Not Exist!");
        signOut({ callbackUrl: "/" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const verifyUser = useRequest(checkUser, {
    refreshDeps: [session, keyword, select],
  });

  return (
    <div className="w-full h-full">
      {open && <Logout />}
      {useDelete.value && <Delete reload={reload} />}
      {useReport.value && <Report reload={reload} />}
      {useEdit.value && edit.id && data && (
        <EditPost
          postId={edit.id}
          data={data}
          mutate={mutate}
          setKeyword={setKeyword}
          keyword={keyword}
        />
      )}

      <AddPost />
      <Form
        data={data}
        mutate={mutate}
        noMore={noMore}
        loadMore={loadMore}
        setKeyword={setKeyword}
        keyword={keyword}
      />
      <div className="w-p-88 m-auto flex items-center justify-end 2xl:w-full 2xl:px-6 xs:px-2">
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
            <option value="posts">My Posts</option>
            <option value="likes">Most Liked</option>
            <option value="engages">Most Engaged</option>
            <option value="comments">Most Commented</option>
          </select>
        </div>
      </div>

      {data && data.list.length === 0 ? (
        <div className="m-auto w-p-88 h-p-90 overflow-hidden flex items-center justify-start">
          <div className="-mt-20 text-8xl leading-snug font-semibold sm:text-7xl">
            We Care <br />
            about what <br />
            you think.
          </div>
        </div>
      ) : (
        <div
          ref={ref}
          className="m-auto w-p-88 h-[85%] overflow-y-auto 2xl:w-full pb-2 2xl:px-14 xl:px-6 md:px-2 xs:px-2"
        >
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
