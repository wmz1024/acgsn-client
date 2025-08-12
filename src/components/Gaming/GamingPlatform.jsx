import { Settings, Download, Grid3X3, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { useSettings } from "../../hooks/useSettings";
import { useCore } from "../../hooks/useCore";
import { CoreDownloadDialog } from "../shared/CoreDownloadDialog";
import { useState, useEffect } from "react";

export const GamingPlatform = ({ onOpenSettings }) => {
  const settings = useSettings();
  const core = useCore();
  const [showCoreDialog, setShowCoreDialog] = useState(false);

  // 检查核心状态，如果不存在则显示下载对话框
  useEffect(() => {
    if (core.coreStatus !== null && !core.coreStatus.exists) {
      setShowCoreDialog(true);
    }
  }, [core.coreStatus]);

  const handleCoreDownload = async () => {
    try {
      await core.downloadCore();
    } catch (err) {
      // 错误由hook处理
    }
  };

  const handleGameLaunch = () => {
    if (!core.coreStatus?.exists) {
      setShowCoreDialog(true);
    } else {
      // TODO: 启动游戏逻辑
      console.log("启动游戏");
    }
  };

  return (
    <div
      className="h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${settings.backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Main content area */}
      <div className="h-full relative">
        {/* Bottom toolbar */}
        <div className="absolute bottom-6 left-6">
          <div className="flex flex-col gap-4">
            {/* Toolbar buttons */}
            <div className="bg-white rounded-md p-2 w-80">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  className="p-3 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md w-10 h-10 flex items-center justify-center"
                  onClick={onOpenSettings}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="p-3 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md w-10 h-10 flex items-center justify-center"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="p-3 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md w-10 h-10 flex items-center justify-center"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Game selection card */}
            <div className="bg-white/20 backdrop-blur-sm rounded-md p-4 w-80">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-200">
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">ACGS</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-white/80">
                      {core.coreStatus?.exists ? "点击启动游戏" : "需要下载核心"}
                    </span>
                    {!core.coreStatus?.exists && (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    )}
                    <ChevronRight className="w-4 h-4 text-white/80" />
                  </div>
                  <button
                    onClick={handleGameLaunch}
                    className="text-left hover:opacity-80 transition-opacity"
                  >
                    <h3 className="text-xl font-bold text-white">
                      {core.coreStatus?.exists ? "「核心已就绪」" : "「尚未初始化核心」"}
                    </h3>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 核心下载对话框 */}
      <CoreDownloadDialog
        open={showCoreDialog}
        onOpenChange={setShowCoreDialog}
        onDownload={handleCoreDownload}
        isLoading={core.isLoading}
        downloadProgress={core.downloadProgress}
        error={core.error}
      />
    </div>
  );
}; 