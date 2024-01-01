"use client";
import React from "react";
import AddPost from "./overlays/AddPost";
import Form from "./Form";
import DisplayPost from "./DisplayPost";
import { useInfiniteScroll } from "ahooks";
import axios from "axios";

let status = ["ERROR", "BUSY"];
export function getPosts(skip: number, take: number): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.post("/api/post/get", {
        skip: skip,
        take: take,
      });

      const data = response.data;

      if (!status.includes(data)) {
        resolve({ list: data });
      } else reject(data);
    } catch (err) {
      console.log(err);
    }
  });
}

function HomeContent() {
  const { data, mutate, loading, loadMore, noMore } = useInfiniteScroll(() =>
    getPosts(4, 4)
  );
  return (
    <>
      <AddPost />
      <Form data={data} mutate={mutate} noMore={noMore} />
      <DisplayPost data={data} loading={loading} loadMore={loadMore} />
    </>
  );
}

export default HomeContent;
