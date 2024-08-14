import axios, { AxiosResponse } from 'axios'
import { BasicResultModel } from './baseModel'

export interface BotInfoModel {
  name: string
  icon_url: string
  /** 开场白信息 */
  onboarding_info: {
    /** 开场白简介 */
    prologue: string
    /** 开场白建议搜索词 */
    suggested_questions: string[]
  }
}
export type BotInfoModelRes = BasicResultModel<BotInfoModel>

const baseUrl = import.meta.env.VITE_AI_URL

/**
 * 初始化file
 * @param data FormData
 * @returns Promise<{ path: string }>
 */
const initFile = (): Promise<AxiosResponse<BotInfoModelRes>> => {
  return axios({
    url: baseUrl + '/file/info',
    method: 'get',
  })
}

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

export { initFile, upfile }
