"use client";
import React from "react";
import Image from "next/image";
import moment from "moment";

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

                <div>{moment(item.createdAt).format("LLL")}</div>
                <hr></hr>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default DisplayPost;
