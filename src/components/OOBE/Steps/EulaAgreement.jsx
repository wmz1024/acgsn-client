import { CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "../../ui/button";

export const EulaAgreement = ({ 
  stepCompleted, 
  error, 
  onHandleEulaStep 
}) => {
  return (
    <div className="text-center">
      <div className="mb-4">
        {stepCompleted ? (
          <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
        ) : (
          <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500" />
        )}
      </div>
      
      {stepCompleted ? (
        <div>
          <p className="text-green-600 font-semibold">✓ 用户协议已同意</p>
          <p className="text-sm text-muted-foreground">
            感谢您同意我们的使用条款
          </p>
        </div>
      ) : (
        <div>
          <p className="text-yellow-600 font-semibold">用户协议确认</p>
          <p className="text-sm text-muted-foreground mb-4">
            请阅读并同意用户协议以继续
          </p>
          
          {error && (
            <p className="text-destructive text-sm mb-4">{error}</p>
          )}
          
          <Button onClick={onHandleEulaStep} className="w-full">
            查看并同意协议
          </Button>
        </div>
      )}
    </div>
  );
}; 