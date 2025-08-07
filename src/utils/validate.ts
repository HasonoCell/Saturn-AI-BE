import { LoginParams, RegisterParams } from '../types/user';

/**
 * 验证登录参数
 */
export const validateLoginParams = (params: LoginParams): void => {
  if (!params.username || !params.password) {
    throw new Error('用户名和密码不能为空');
  }
  
  if (params.username.trim().length === 0 || params.password.trim().length === 0) {
    throw new Error('用户名和密码不能包含空白字符');
  }
};

/**
 * 验证注册参数
 */
export const validateRegisterParams = (params: RegisterParams): void => {
  if (!params.username || !params.password || !params.nickname) {
    throw new Error('用户名、密码和昵称不能为空');
  }
  
  if (params.username.trim().length === 0 || 
      params.password.trim().length === 0 || 
      params.nickname.trim().length === 0) {
    throw new Error('用户名、密码和昵称不能包含空白字符');
  }
  
  if (params.username.length < 2) {
    throw new Error('用户名至少2个字符');
  }
  
  if (params.password.length < 2) {
    throw new Error('密码至少2个字符');
  }
  
  if (params.nickname.length > 20) {
    throw new Error('昵称不能超过20个字符');
  }
  
  // 用户名格式验证（只允许字母、数字、下划线）
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(params.username)) {
    throw new Error('用户名只能包含字母、数字和下划线');
  }
};