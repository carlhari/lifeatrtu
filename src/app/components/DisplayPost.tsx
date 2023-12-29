"use client";
import React from "react";
import Image from "next/image";

const DisplayPost: React.FC<any> = ({ data, loading, loadMore, noMore }) => {
  console.log(data);
  return (
    <div>
      {loading ? "loading" : ""}
      <div>
        {data &&
          data.list &&
          data.list.map((item: any, key: any) => {
            return (
              <div key={key}>
                <div>{item.id}</div>
                <div>{item.title}</div>
                <div>{item.focus}</div>
                <div>{item.content}</div>

                {item.image && (
                  <img loading="lazy" src={item.image} alt={"Image Content"} />
                )}
              </div>
            );
          })}
        {noMore && <button onClick={loadMore}>LoadMOre</button>}
      </div>
    </div>
  );
};

export default DisplayPost;
