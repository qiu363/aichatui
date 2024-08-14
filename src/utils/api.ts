import axios, { AxiosResponse } from 'axios'

const baseUrl = import.meta.env.VITE_AI_URL

/**
 * 文件上传API
 * @param data FormData
 * @returns Promise<{ path: string }>
 */
const upfile = (
  data: FormData,
): Promise<
  AxiosResponse<{
    /** 上传文件地址 */
    path: string
  }>
> => {
  return axios({
    url: baseUrl + '/upload',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data,
  })
}

export { upfile }
