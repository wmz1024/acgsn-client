import { useState } from "react";
import { SettingsSidebar } from "./SettingsSidebar";
import { PersonalizationSettings } from "./PersonalizationSettings";
import { ComponentSettings } from "./ComponentSettings";
import { AccountSettings } from "./AccountSettings";
import { ConsoleSettings } from "./ConsoleSettings";
import { useSettings } from "../../hooks/useSettings";

export const SettingsPage = ({ onBack }) => {
  const [currentTab, setCurrentTab] = useState("personalization");
  const settings = useSettings();

  const handleSave = () => {
    settings.saveSettings();
    // 可以添加保存成功的提示
  };

  const renderContent = () => {
    switch (currentTab) {
      case "personalization":
        return (
          <PersonalizationSettings
            backgroundUrl={settings.backgroundUrl}
            tempBackgroundUrl={settings.tempBackgroundUrl}
            onBackgroundUrlChange={settings.setTempBackgroundUrl}
            onSave={handleSave}
            onResetToDefault={settings.resetToDefault}
          />
        );
      case "components":
        return <ComponentSettings />;
      case "account":
        return <AccountSettings />;
      case "console":
        return <ConsoleSettings />;
      default:
        return (
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">页面不存在</h2>
              <p className="text-muted-foreground">请选择左侧的设置选项</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* 侧边栏 */}
      <SettingsSidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onBack={onBack}
      />
      
      {/* 主内容区 */}
      {renderContent()}
    </div>
  );
}; 