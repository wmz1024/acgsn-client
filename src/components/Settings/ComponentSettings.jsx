import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Package, Download, CheckCircle, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useCore } from "../../hooks/useCore";
import { CoreDownloadDialog } from "../shared/CoreDownloadDialog";
import { useState } from "react";

export const ComponentSettings = () => {
  const core = useCore();
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  const handleDownload = async () => {
    try {
      await core.downloadCore();
    } catch (err) {
      // 错误由hook处理
    }
  };

  const getCoreStatusIcon = () => {
    if (core.coreStatus?.exists) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getCoreStatusText = () => {
    if (core.coreStatus?.exists) {
      return "已安装";
    } else {
      return "未安装";
    }
  };

  const getCoreStatusColor = () => {
    if (core.coreStatus?.exists) {
      return "text-green-600";
    } else {
      return "text-yellow-600";
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-2xl font-bold">组件管理</h1>
          <p className="text-muted-foreground">管理游戏核心文件和其他组件</p>
        </div>

        {/* 核心文件管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              游戏核心
            </CardTitle>
            <CardDescription>
              CMCL启动器核心文件，用于管理和启动Minecraft游戏
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 核心状态 */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getCoreStatusIcon()}
                <div>
                  <div className="font-medium">核心状态</div>
                  <div className={`text-sm ${getCoreStatusColor()}`}>
                    {getCoreStatusText()}
                    {core.coreStatus?.exists && core.coreStatus.size && (
                      <span className="text-muted-foreground ml-2">
                        ({core.formatFileSize(core.coreStatus.size)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={core.checkCoreStatus}
                  disabled={core.isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${core.isLoading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
                
                {!core.coreStatus?.exists && (
                  <Button
                    size="sm"
                    onClick={() => setShowDownloadDialog(true)}
                    disabled={core.isLoading}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    下载
                  </Button>
                )}
              </div>
            </div>

            {/* 核心详情 */}
            {core.coreStatus?.exists && (
              <div className="space-y-3">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">文件路径:</span>
                    <span className="font-mono text-xs break-all max-w-xs text-right">
                      {core.coreStatus.path}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">文件大小:</span>
                    <span>{core.formatFileSize(core.coreStatus.size)}</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDownloadDialog(true)}
                    disabled={core.isLoading}
                  >
                    重新下载
                  </Button>
                </div>
              </div>
            )}

            {/* 错误信息 */}
            {core.error && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium">操作失败</div>
                  <div className="mt-1">{core.error}</div>
                </div>
              </div>
            )}

            {/* 下载说明 */}
            {!core.coreStatus?.exists && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <div className="font-medium mb-1">关于核心下载</div>
                <div>
                  核心文件将从官方源下载到本地数据目录。首次下载可能需要几分钟时间，
                  请确保网络连接稳定。下载完成后即可正常启动游戏。
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 其他组件 */}
        <Card>
          <CardHeader>
            <CardTitle>其他组件</CardTitle>
            <CardDescription>
              额外的游戏组件和工具
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Mod加载器</div>
                    <div className="text-xs text-muted-foreground">
                      Forge/Fabric支持
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled>
                  即将推出
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">资源包管理</div>
                    <div className="text-xs text-muted-foreground">
                      材质包和数据包
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled>
                  即将推出
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg opacity-50">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">版本管理</div>
                    <div className="text-xs text-muted-foreground">
                      多版本游戏支持
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled>
                  即将推出
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground mt-4">
              ⚠️ 其他组件功能正在开发中，敬请期待
            </div>
          </CardContent>
        </Card>

        {/* 存储信息 */}
        <Card>
          <CardHeader>
            <CardTitle>存储信息</CardTitle>
            <CardDescription>
              查看组件文件的存储使用情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">核心文件:</span>
                <span>
                  {core.coreStatus?.exists 
                    ? core.formatFileSize(core.coreStatus.size) 
                    : "0 B"
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">总计使用:</span>
                <span>
                  {core.coreStatus?.exists 
                    ? core.formatFileSize(core.coreStatus.size) 
                    : "0 B"
                  }
                </span>
              </div>
              
              <div className="pt-2">
                <Button variant="outline" size="sm" disabled>
                  <Package className="w-4 h-4 mr-2" />
                  清理缓存 (即将推出)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 核心下载对话框 */}
      <CoreDownloadDialog
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
        onDownload={handleDownload}
        isLoading={core.isLoading}
        downloadProgress={core.downloadProgress}
        error={core.error}
      />
    </div>
  );
}; 