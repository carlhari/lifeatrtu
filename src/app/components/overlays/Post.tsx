import { usePost } from '@/utils/usePost'
import { useRequest } from 'ahooks'
import axios from 'axios'
import React from 'react'

function Post({ postId }: { postId: string }) {

    const { close } = usePost()

    function getPost(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post("/api/post/get/specific", { postId: postId })
                const data = response.data
                if (data.ok) {
                    resolve(data)
                } else reject(data)
            } catch (err) {
                reject(err)
            }
        })
    }

    const { data, loading, mutate } = useRequest(() => getPost())

    console.log(data)


    return (loading ? "loading" : (<div className="w-full h-screen z-50 fixed top-0 left-0 bg-slate-500"><div></div></div>))
}

        export default Post