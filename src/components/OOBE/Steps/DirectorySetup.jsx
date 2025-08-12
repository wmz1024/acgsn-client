import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "../../ui/button";

export const DirectorySetup = ({ 
  loading, 
  stepCompleted, 
  acgsDir, 
  error, 
  onCreateDirectory 
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
        <p>正在创建应用目录...</p>
      ) : stepCompleted ? (
        <div>
          <p className="text-green-600 font-semibold">✓ 目录创建完成</p>
          <p className="text-sm text-muted-foreground break-all">
            {acgsDir}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-yellow-600 font-semibold">创建应用目录</p>
          <p className="text-sm text-muted-foreground mb-4">
            将在Documents目录创建acgsnetwork文件夹
          </p>
          
          {error && (
            <p className="text-destructive text-sm mb-4">{error}</p>
          )}
          
          <Button onClick={onCreateDirectory} className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            创建目录
          </Button>
        </div>
      )}
    </div>
  );
}; 