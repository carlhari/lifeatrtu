"use client";
import React from "react";
import Image from "next/image";

const DisplayPost: React.FC<any> = ({
  data,
  loading,
  loadMore,
  noMore,
  loadingMore,
}) => {
  return (
    <>
      {loading && "loading"}
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
                  <Image
                    loading="lazy"
                    src={item.image}
                    alt={"Image Content"}
                  />
                )}
              </div>
            );
          })}
        {!noMore && (
          <button type="button" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading more..." : "Click to load more"}
          </button>
        )}
      </div>
    </>
  );
};

export default DisplayPost;
