import { CheckCircle, AlertTriangle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "../../ui/button";

export const JavaCheck = ({ 
  loading, 
  javaStatus, 
  error, 
  onOpenJavaDownload, 
  onRetryJavaCheck 
}) => {
  return (
    <div className="text-center">
      <div className="mb-4">
        {loading ? (
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        ) : javaStatus?.installed ? (
          <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
        ) : (
          <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500" />
        )}
      </div>
      
      {loading ? (
        <p>正在检查Java环境...</p>
      ) : javaStatus?.installed ? (
        <div>
          <p className="text-green-600 font-semibold">✓ Java环境检查通过</p>
          <p className="text-sm text-muted-foreground">
            版本: {javaStatus.version}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-yellow-600 font-semibold">Java环境检查</p>
          <p className="text-sm text-muted-foreground mb-4">
            需要Java 17或更高版本运行此应用
          </p>
          {javaStatus?.version && (
            <p className="text-sm text-muted-foreground mb-4">
              当前版本: {javaStatus.version}
            </p>
          )}
          
          {error && (
            <p className="text-destructive text-sm mb-4">{error}</p>
          )}
          
          <div className="space-y-2">
            <Button onClick={onOpenJavaDownload} className="w-full" variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              下载Java 17+
            </Button>
            <Button onClick={onRetryJavaCheck} className="w-full">
              重新检查
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}; 