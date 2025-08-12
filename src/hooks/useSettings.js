import { useState, useEffect } from "react";
import { storage } from "../utils/storage";

export const useSettings = () => {
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [tempBackgroundUrl, setTempBackgroundUrl] = useState("");

  // 初始化加载设置
  useEffect(() => {
    const savedBackgroundUrl = storage.getBackgroundUrl();
    setBackgroundUrl(savedBackgroundUrl);
    setTempBackgroundUrl(savedBackgroundUrl);
  }, []);

  // 保存设置
  const saveSettings = () => {
    if (tempBackgroundUrl.trim()) {
      const newUrl = tempBackgroundUrl.trim();
      setBackgroundUrl(newUrl);
      storage.setBackgroundUrl(newUrl);
    }
  };

  // 取消设置
  const cancelSettings = () => {
    setTempBackgroundUrl(backgroundUrl);
  };

  // 重置为默认背景
  const resetToDefault = () => {
    const defaultUrl = "https://1.888440.xyz/global-free/2025/08/12/guest/689ad9da824ae.png";
    setTempBackgroundUrl(defaultUrl);
  };

  // 应用临时背景（用于实时预览）
  const applyTempBackground = () => {
    if (tempBackgroundUrl.trim()) {
      setBackgroundUrl(tempBackgroundUrl.trim());
    }
  };

  return {
    // 状态
    backgroundUrl,
    tempBackgroundUrl,
    
    // 方法
    saveSettings,
    cancelSettings,
    resetToDefault,
    applyTempBackground,
    setTempBackgroundUrl
  };
}; 