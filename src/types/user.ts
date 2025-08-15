
export interface UserAuth {
  nickname: string;
  token: string;
}

export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
}

// 登录请求参数
export interface LoginParams {
  username: string;
  password: string;
}

// 注册请求参数
export interface RegisterParams {
  username: string;
  password: string;
  nickname: string;
}

// API 响应格式
export interface ResponseData<T> {
  data: T;
  message: string;
  code: number;
}
