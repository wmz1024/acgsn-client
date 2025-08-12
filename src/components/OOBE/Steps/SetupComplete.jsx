import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "../../ui/button";

export const SetupComplete = ({ 
  loading, 
  stepCompleted, 
  error, 
  onCompleteSetup 
}) => {
  return (
    <div className="text-center">
      <div className="mb-4">
        {loading ? (
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        ) : stepCompleted ? (
          <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
        ) : (
          <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500" />
        )}
      </div>
      
      {loading ? (
        <p>正在完成设置...</p>
      ) : stepCompleted ? (
        <div>
          <p className="text-green-600 font-semibold">✓ 设置完成</p>
          <p className="text-sm text-muted-foreground">
            即将进入主界面...
          </p>
        </div>
      ) : (
        <div>
          <p className="text-yellow-600 font-semibold">完成设置</p>
          <p className="text-sm text-muted-foreground mb-4">
            点击完成按钮以完成初始化设置
          </p>
          
          {error && (
            <p className="text-destructive text-sm mb-4">{error}</p>
          )}
          
          <Button onClick={onCompleteSetup} className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            完成设置
          </Button>
        </div>
      )}
    </div>
  );
}; 