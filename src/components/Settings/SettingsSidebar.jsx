import { User, Palette, ArrowLeft, Package, Terminal } from "lucide-react";
import { Button } from "../ui/button";

export const SettingsSidebar = ({ currentTab, onTabChange, onBack }) => {
  const menuItems = [
    {
      id: "personalization",
      label: "个性化",
      icon: Palette,
      description: "主题、背景等外观设置"
    },
    {
      id: "components",
      label: "组件管理",
      icon: Package,
      description: "核心文件和组件下载"
    },
    {
      id: "account",
      label: "账户",
      icon: User,
      description: "用户信息和账户管理"
    },
    {
      id: "console",
      label: "控制台",
      icon: Terminal,
      description: "内嵌命令行终端"
    }
  ];

  return (
    <div className="w-64 bg-card border-r border-border h-full flex flex-col">
      {/* 返回按钮 */}
      <div className="p-4 border-b border-border">
        <Button
          variant="ghost"
          onClick={onBack}
          className="w-full justify-start"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回主界面
        </Button>
      </div>

      {/* 设置标题 */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">设置</h2>
        <p className="text-sm text-muted-foreground">配置您的应用偏好</p>
      </div>

      {/* 菜单项 */}
      <div className="flex-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full p-3 rounded-lg text-left transition-colors mb-1 ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs mt-0.5 ${
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}>
                    {item.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}; 