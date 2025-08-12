import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export const useOOBE = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [javaStatus, setJavaStatus] = useState(null);
  const [showEulaDialog, setShowEulaDialog] = useState(false);
  const [eulaAccepted, setEulaAccepted] = useState(false);
  const [acgsDir, setAcgsDir] = useState("");
  const [error, setError] = useState("");
  
  // 步骤完成状态
  const [stepCompleted, setStepCompleted] = useState({
    0: false, // Java检查
    1: false, // 目录创建
    2: false, // EULA同意
    3: false  // 设置完成
  });

  const steps = [
    "检查环境",
    "创建目录", 
    "用户协议",
    "完成设置"
  ];

  // Java环境检查
  const checkJavaVersion = async () => {
    setLoading(true);
    setError("");
    
    try {
      const result = await invoke("check_java_version");
      setJavaStatus(result);
      
      if (!result.installed) {
        setError("需要安装Java 17或更高版本");
        setStepCompleted(prev => ({ ...prev, 0: false }));
      } else {
        setStepCompleted(prev => ({ ...prev, 0: true }));
      }
    } catch (err) {
      setError("检查Java版本时出错: " + err);
      setJavaStatus({ installed: false, version: null });
      setStepCompleted(prev => ({ ...prev, 0: false }));
    } finally {
      setLoading(false);
    }
  };

  // 打开Java下载页面
  const openJavaDownload = async () => {
    try {
      await invoke("open_java_download");
    } catch (err) {
      console.error("打开Java下载页面失败:", err);
    }
  };

  // 创建目录
  const createDirectory = async () => {
    setLoading(true);
    setError("");
    
    try {
      const dirPath = await invoke("create_acgs_directory");
      setAcgsDir(dirPath);
      setStepCompleted(prev => ({ ...prev, 1: true }));
    } catch (err) {
      setError("创建目录失败: " + err);
      setStepCompleted(prev => ({ ...prev, 1: false }));
    } finally {
      setLoading(false);
    }
  };

  // 打开EULA页面
  const openEula = async () => {
    try {
      await invoke("open_eula");
    } catch (err) {
      console.error("打开EULA页面失败:", err);
    }
  };

  // 处理EULA步骤
  const handleEulaStep = () => {
    setShowEulaDialog(true);
  };

  // 同意EULA
  const acceptEula = async () => {
    setEulaAccepted(true);
    setShowEulaDialog(false);
    setStepCompleted(prev => ({ ...prev, 2: true }));
  };

  // 拒绝EULA
  const declineEula = () => {
    setShowEulaDialog(false);
    setError("必须同意用户协议才能继续使用");
    setStepCompleted(prev => ({ ...prev, 2: false }));
  };

  // 完成设置
  const completeSetup = async () => {
    setLoading(true);
    setError("");
    
    try {
      await invoke("create_oobe_lock");
      setStepCompleted(prev => ({ ...prev, 3: true }));
      return true; // 表示成功完成
    } catch (err) {
      setError("完成设置时出错: " + err);
      setStepCompleted(prev => ({ ...prev, 3: false }));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 重试Java检查
  const retryJavaCheck = () => {
    setError("");
    checkJavaVersion();
  };

  // 导航函数
  const nextStep = () => {
    if (currentStep < 3) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      // 执行下一步的初始化操作
      if (newStep === 1 && !stepCompleted[1]) {
        createDirectory();
      } else if (newStep === 2 && !stepCompleted[2]) {
        handleEulaStep();
      } else if (newStep === 3 && !stepCompleted[3]) {
        completeSetup();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(""); // 清除错误信息
    }
  };

  // 检查是否可以进入下一步
  const canGoNext = () => {
    return stepCompleted[currentStep] && !loading;
  };

  // 检查是否可以返回上一步
  const canGoPrev = () => {
    return currentStep > 0 && !loading;
  };

  return {
    // 状态
    currentStep,
    loading,
    javaStatus,
    showEulaDialog,
    eulaAccepted,
    acgsDir,
    error,
    stepCompleted,
    steps,
    
    // 方法
    checkJavaVersion,
    openJavaDownload,
    createDirectory,
    openEula,
    handleEulaStep,
    acceptEula,
    declineEula,
    completeSetup,
    retryJavaCheck,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    setShowEulaDialog
  };
}; 