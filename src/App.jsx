import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { OOBEWizard } from "./components/OOBE/OOBEWizard";
import { GamingPlatform } from "./components/Gaming/GamingPlatform";
import { SettingsPage } from "./components/Settings/SettingsPage";

function App() {
  const [isOOBECompleted, setIsOOBECompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("gaming"); // gaming, settings

  // 检查OOBE是否已完成
  useEffect(() => {
    checkOOBEStatus();
  }, []);

  const checkOOBEStatus = async () => {
    try {
      const completed = await invoke("check_oobe_completed");
      setIsOOBECompleted(completed);
    } catch (err) {
      console.error("检查OOBE状态失败:", err);
      setIsOOBECompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  // OOBE完成回调
  const handleOOBEComplete = () => {
    setIsOOBECompleted(true);
  };

  // 导航到设置页面
  const navigateToSettings = () => {
    setCurrentPage("settings");
  };

  // 返回主界面
  const navigateToGaming = () => {
    setCurrentPage("gaming");
  };

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在加载...</p>
        </div>
      </div>
    );
  }

  // 如果OOBE未完成，显示向导
  if (!isOOBECompleted) {
    return <OOBEWizard onComplete={handleOOBEComplete} />;
  }

  // 根据当前页面渲染对应组件
  switch (currentPage) {
    case "settings":
      return <SettingsPage onBack={navigateToGaming} />;
    case "gaming":
    default:
      return <GamingPlatform onOpenSettings={navigateToSettings} />;
  }
}

export default App;
