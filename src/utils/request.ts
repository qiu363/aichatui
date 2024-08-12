import _ from 'lodash'

type TFetchOptions = Omit<RequestInit, 'headers' | 'body'> & {
  headers?: Record<string, any>
  params?: Record<string, any>
  body?: Record<string, any> | BodyInit | null
  timeout?: number
}

type TResponseCallback = {
  onData?: (data: any) => void // chunk的回调
  onEnd?: () => void // 传输完毕的回调
  onError?: (err: any) => void // 错误的回调
  setAbortController?: (controller: AbortController) => void // 获取中止控制器的回调
  onAborted?: () => void // 中止的回调
}

// 默认配置
const defaultOptions: Partial<TFetchOptions> = {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  },
  timeout: 60 * 1000,
}

// 拦截器
const requestInterceptors = (options: TFetchOptions) => {
  if (!options.headers) options.headers = {}
  options.headers['token'] = '111'
  return options
}

// get请求body转化成query
const parseParams = (params?: Record<string, any>) => {
  const searchObj = new URLSearchParams()
  Object.entries(params || {}).forEach(([key, value]) => {
    searchObj.append(key, value)
  })
  const query = searchObj.toString()
  return query ? `?${query}` : ''
}

// fetch封装
// fetch封装
const baseFetch = (url: string, fetchOptions?: TFetchOptions, callback?: TResponseCallback) => {
  // 取消请求的控制器
  const abortController = new AbortController()
  callback?.setAbortController?.(abortController)

  // 处理request配置
  let options = _.merge(
    { signal: abortController.signal },
    defaultOptions,
    fetchOptions,
  ) as TFetchOptions
  options = requestInterceptors(options)

  // 处理request参数
  let urlFix = url
  if (_.toUpper(options.method) === 'GET') {
    fetchOptions?.params && (urlFix = url + parseParams(fetchOptions.params))
  } else {
    fetchOptions?.body && (options.body = JSON.stringify(fetchOptions.body))
  }

  // 响应处理
  return globalThis
    .fetch(urlFix, options as RequestInit)
    .then((res) => {
      const response = res.clone()
      return /^(2|3)\d{2}$/.test(String(res.status))
        ? handleStream(response, callback)
        : handleError(response, callback)
    })
    .catch((err) => {
      if (err.name === 'AbortError') {
        callback?.onAborted?.()
      } else {
        callback?.onError?.(err)
      }
      callback?.onEnd?.()
    })
}

// 处理错误
const handleError = (response: Response, _callback?: TResponseCallback) => {
  if (response.status === 401) {
    window.location.href = '/login'
  }
}

// 处理流式数据
const handleStream = async (response: Response, callback?: TResponseCallback) => {
  if (!response.ok) {
    throw new Error('服务出错')
  }
  const reader = response.body?.getReader()
  const textDecoder = new TextDecoder('utf-8')
  while (reader) {
    const chunk = await reader.read()
    if (chunk?.done) {
      callback?.onEnd?.()
      break
    }
    const chunkText = textDecoder.decode(chunk?.value)
    callback?.onData?.(chunkText)
  }
}

export const postStream = (
  url: string,
  body?: Record<string, any>,
  callback?: TResponseCallback,
) => {
  return baseFetch(url, { method: 'post', body }, callback)
}

export const getStream = (
  url: string,
  params?: Record<string, any>,
  callback?: TResponseCallback,
) => {
  return baseFetch(url, { method: 'get', params }, callback)
}
