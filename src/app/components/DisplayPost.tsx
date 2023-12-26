"use client";
import axios from "axios";
import React, { useState } from "react";
import { useInfiniteScroll } from "ahooks";
import { resolve } from "path";
import { rejects } from "assert";

let status = ["ERROR", "BUSY"];

export function getPosts(take: number, skip: number): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.post("/api/post/get", {
        take: take,
        skip: skip,
      });

      const data = response.data;

      if (!status.includes(data)) {
        resolve({ list: data });
      } else reject(data);
    } catch (err) {}
  });
}

export function useInfinite() {
  return useInfiniteScroll((d) => getPosts(4, 4));
}

function DisplayPost() {
  const { data, loading, loadingMore } = useInfinite();
  return (
    <div>
      <div>
        {loading && <div>Loading..</div>}
        {loadingMore && <div>Loading More</div>}
        {data?.list.map((item) => {
          return (
            <div key={item.id}>
              <div>{item.id}</div>
              <div>{item.title}</div>
              <div>{item.focus}</div>
              <div>{item.content}</div>
              {item.img && <img src={item.img} />}
            </div>
          );
        })}

        <button onClick={() => getPosts(4, 4)}>Get</button>
      </div>
    </div>
  );
}

export default DisplayPost;
