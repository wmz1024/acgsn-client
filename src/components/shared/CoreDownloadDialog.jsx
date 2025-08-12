import { Download, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

export const CoreDownloadDialog = ({
  open,
  onOpenChange,
  onDownload,
  isLoading,
  downloadProgress,
  error
}) => {
  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleDownload = async () => {
    try {
      await onDownload();
      // 下载成功后关闭对话框
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      // 错误处理由hook处理
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            核心下载
          </DialogTitle>
          <DialogDescription>
            需要下载游戏核心文件才能启动游戏
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 下载信息 */}
          <div className="space-y-2">
            <div className="text-sm">
              <div className="font-medium">核心文件: CMCL</div>
              <div className="text-muted-foreground">
                来源: https://static.v0.net.cn/cmcl.jar
              </div>
            </div>
          </div>

          {/* 下载进度 */}
          {downloadProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>下载进度</span>
                <span>{Math.round(downloadProgress.percentage)}%</span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress.percentage}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {formatBytes(downloadProgress.downloaded)}
                  {downloadProgress.total && ` / ${formatBytes(downloadProgress.total)}`}
                </span>
                <span>
                  {downloadProgress.percentage === 100 ? "下载完成" : "下载中..."}
                </span>
              </div>
            </div>
          )}

          {/* 状态显示 */}
          {isLoading && !downloadProgress && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>准备下载...</span>
            </div>
          )}

          {downloadProgress?.percentage === 100 && (
            <div className="flex items-center justify-center py-4 text-green-600">
              <CheckCircle className="w-6 h-6 mr-2" />
              <span>下载完成!</span>
            </div>
          )}

          {/* 错误信息 */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium">下载失败</div>
                <div className="mt-1">{error}</div>
              </div>
            </div>
          )}

          {/* 说明文本 */}
          {!isLoading && !downloadProgress && !error && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <div className="font-medium mb-1">关于核心文件</div>
              <div>
                核心文件是游戏启动器的重要组件，用于管理和启动Minecraft游戏。
                文件将下载到本地数据目录中，确保网络连接稳定。
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button 
            onClick={handleDownload}
            disabled={isLoading || downloadProgress?.percentage === 100}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                下载中...
              </>
            ) : downloadProgress?.percentage === 100 ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                完成
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                开始下载
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 