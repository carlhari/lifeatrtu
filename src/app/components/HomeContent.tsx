"use client";
import React, { useEffect, useRef, useState } from "react";
import AddPost from "./overlays/AddPost";
import Form from "./Form";
import DisplayPost from "./DisplayPost";
import { useInfiniteScroll } from "ahooks";
import axios from "axios";

let status = ["ERROR", "BUSY"];

export function getPosts(
  skip: number,
  take: number,
  order: string
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.post("/api/post/get", {
        skip: skip,
        take: take,
        order: order,
      });

      const data = response.data;
      const newSkip = skip + take;

      if (!status.includes(data)) {
        resolve({
          list: data,
          skip: data && data.length < 4 ? undefined : newSkip,
        });
      } else reject(data);
    } catch (err) {
      console.log(err);
    }
  });
}

function HomeContent() {
  const ref = useRef<HTMLDivElement>(null);
  const [keyword, setKeyword] = useState<string>("");
  const [select, setSelect] = useState<string>("desc");
  const { data, mutate, loading, loadMore, noMore, loadingMore, reload } =
    useInfiniteScroll((d) => getPosts(d?.skip ? d?.skip : 0, 4, select), {
      target: ref,
      isNoMore: (d) => {
        if (d?.skip === undefined) return true;
        else return false;
      },
      reloadDeps: [keyword],
    });

  useEffect(() => {
    reload();
  }, [keyword, select]);

  return (
    <>
      <AddPost />
      <Form
        data={data}
        mutate={mutate}
        noMore={noMore}
        loadMore={loadMore}
        setKeyword={setKeyword}
        keyword={keyword}
      />
      <div ref={ref} className="overflow-auto columns-4 gap-5 mb-4">
        <select
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSelect(e.target.value)
          }
          defaultValue={"desc"}
        >
          <option value="desc">Recently</option>
          <option value="asc">Oldest</option>
          <option value="likes">Most Liked</option>
          <option value="engages">Most Engaged</option>
          <option value="comments">Most Commented</option>
        </select>

        <DisplayPost
          data={data}
          loading={loading}
          loadMore={loadMore}
          loadingMore={loadingMore}
          mutate={mutate}
        />
      </div>
      {!loading && noMore && "no more"}
    </>
  );
}

export default HomeContent;
