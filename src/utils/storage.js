// 本地存储工具函数
export const storage = {
  // 获取背景URL
  getBackgroundUrl: () => {
    return localStorage.getItem("backgroundUrl") || "https://1.888440.xyz/global-free/2025/08/12/guest/689ad9da824ae.png";
  },

  // 设置背景URL
  setBackgroundUrl: (url) => {
    localStorage.setItem("backgroundUrl", url);
  },

  // 获取其他设置
  getSetting: (key, defaultValue = null) => {
    const value = localStorage.getItem(key);
    try {
      return value ? JSON.parse(value) : defaultValue;
    } catch {
      return value || defaultValue;
    }
  },

  // 设置其他设置
  setSetting: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },

  // 清除设置
  removeSetting: (key) => {
    localStorage.removeItem(key);
  }
}; 