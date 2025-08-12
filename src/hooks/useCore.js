import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export const useCore = () => {
  const [coreStatus, setCoreStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [error, setError] = useState("");

  // 检查核心状态
  const checkCoreStatus = async () => {
    try {
      const status = await invoke("check_core_exists");
      setCoreStatus(status);
      return status;
    } catch (err) {
      console.error("检查核心状态失败:", err);
      setError("检查核心状态失败: " + err);
      return null;
    }
  };

  // 下载核心
  const downloadCore = async () => {
    setIsLoading(true);
    setError("");
    setDownloadProgress({ downloaded: 0, total: 0, percentage: 0 });

    try {
      // 监听下载进度
      const unlisten = await listen("download-progress", (event) => {
        setDownloadProgress(event.payload);
      });

      // 开始下载
      const result = await invoke("download_core");
      
      // 下载完成，重新检查状态
      await checkCoreStatus();
      
      // 清理监听器
      unlisten();
      
      setDownloadProgress(null);
      return result;
    } catch (err) {
      console.error("下载核心失败:", err);
      setError("下载核心失败: " + err);
      setDownloadProgress(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 获取核心路径
  const getCorePath = async () => {
    try {
      return await invoke("get_core_path");
    } catch (err) {
      console.error("获取核心路径失败:", err);
      setError("获取核心路径失败: " + err);
      return null;
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (!bytes) return "未知";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  // 初始化时检查核心状态
  useEffect(() => {
    checkCoreStatus();
  }, []);

  return {
    // 状态
    coreStatus,
    isLoading,
    downloadProgress,
    error,
    
    // 方法
    checkCoreStatus,
    downloadCore,
    getCorePath,
    formatFileSize,
    
    // 工具方法
    setError
  };
}; 