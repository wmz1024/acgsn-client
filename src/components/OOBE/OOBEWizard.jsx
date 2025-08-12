import { useEffect } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { StepIndicator } from "../shared/StepIndicator";
import { JavaCheck } from "./Steps/JavaCheck";
import { DirectorySetup } from "./Steps/DirectorySetup";
import { EulaAgreement } from "./Steps/EulaAgreement";
import { SetupComplete } from "./Steps/SetupComplete";
import { useOOBE } from "../../hooks/useOOBE";

export const OOBEWizard = ({ onComplete }) => {
  const oobe = useOOBE();

  // 初始化时检查Java环境
  useEffect(() => {
    oobe.checkJavaVersion();
  }, []);

  // 监听第3步完成，自动跳转到主界面
  useEffect(() => {
    if (oobe.stepCompleted[3]) {
      setTimeout(() => {
        onComplete();
      }, 500);
    }
  }, [oobe.stepCompleted, onComplete]);

  const renderCurrentStep = () => {
    switch (oobe.currentStep) {
      case 0:
        return (
          <JavaCheck
            loading={oobe.loading}
            javaStatus={oobe.javaStatus}
            error={oobe.error}
            onOpenJavaDownload={oobe.openJavaDownload}
            onRetryJavaCheck={oobe.retryJavaCheck}
          />
        );
      case 1:
        return (
          <DirectorySetup
            loading={oobe.loading}
            stepCompleted={oobe.stepCompleted[1]}
            acgsDir={oobe.acgsDir}
            error={oobe.error}
            onCreateDirectory={oobe.createDirectory}
          />
        );
      case 2:
        return (
          <EulaAgreement
            stepCompleted={oobe.stepCompleted[2]}
            error={oobe.error}
            onHandleEulaStep={oobe.handleEulaStep}
          />
        );
      case 3:
        return (
          <SetupComplete
            loading={oobe.loading}
            stepCompleted={oobe.stepCompleted[3]}
            error={oobe.error}
            onCompleteSetup={oobe.completeSetup}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ACGS Network 初始化</CardTitle>
          <CardDescription>首次运行设置向导</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 进度指示器 */}
          <StepIndicator
            steps={oobe.steps}
            currentStep={oobe.currentStep}
            stepCompleted={oobe.stepCompleted}
          />

          {/* 当前步骤内容 */}
          <div className="space-y-4">
            {renderCurrentStep()}
          </div>

          {/* 导航按钮 */}
          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={oobe.prevStep}
              disabled={!oobe.canGoPrev()}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一步
            </Button>
            
            <Button
              onClick={oobe.nextStep}
              disabled={!oobe.canGoNext()}
              className="flex items-center"
            >
              下一步
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* EULA对话框 */}
      <Dialog open={oobe.showEulaDialog} onOpenChange={oobe.setShowEulaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>用户许可协议 (EULA)</DialogTitle>
            <DialogDescription>
              请仔细阅读以下用户许可协议。使用本软件即表示您同意遵守协议条款。
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4">
            <Button 
              onClick={oobe.openEula} 
              variant="outline" 
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              查看完整协议内容
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={oobe.declineEula}>
              拒绝
            </Button>
            <Button onClick={oobe.acceptEula}>
              同意并继续
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 