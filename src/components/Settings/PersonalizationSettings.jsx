import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export const PersonalizationSettings = ({
  backgroundUrl,
  tempBackgroundUrl,
  onBackgroundUrlChange,
  onSave,
  onResetToDefault
}) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-2xl font-bold">个性化设置</h1>
          <p className="text-muted-foreground">自定义应用的外观和主题</p>
        </div>

        {/* 背景设置 */}
        <Card>
          <CardHeader>
            <CardTitle>背景图片</CardTitle>
            <CardDescription>
              设置主界面的背景图片，支持网络图片URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="background-url">背景图片URL</Label>
              <Input
                id="background-url"
                type="url"
                placeholder="输入背景图片URL"
                value={tempBackgroundUrl}
                onChange={(e) => onBackgroundUrlChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                输入有效的图片URL来更改背景
              </p>
            </div>
            
            {/* 当前背景预览 */}
            <div className="space-y-2">
              <Label>当前背景预览</Label>
              <div 
                className="w-full h-32 rounded-md border bg-muted overflow-hidden"
                style={{
                  backgroundImage: `url(${backgroundUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
            </div>

            {/* 新背景预览 */}
            {tempBackgroundUrl && tempBackgroundUrl !== backgroundUrl && (
              <div className="space-y-2">
                <Label>新背景预览</Label>
                <div 
                  className="w-full h-32 rounded-md border bg-muted overflow-hidden"
                  style={{
                    backgroundImage: `url(${tempBackgroundUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onResetToDefault}
                className="flex-1"
              >
                重置为默认
              </Button>
              <Button
                onClick={onSave}
                className="flex-1"
                disabled={!tempBackgroundUrl || tempBackgroundUrl === backgroundUrl}
              >
                应用更改
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 主题设置 */}
        <Card>
          <CardHeader>
            <CardTitle>主题设置</CardTitle>
            <CardDescription>
              选择应用的颜色主题和外观风格
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>主题模式</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      浅色
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      深色
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>主色调</Label>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-primary"></div>
                    <div className="w-8 h-8 rounded-full bg-green-500 border"></div>
                    <div className="w-8 h-8 rounded-full bg-purple-500 border"></div>
                    <div className="w-8 h-8 rounded-full bg-red-500 border"></div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                ⚠️ 主题设置功能即将推出
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 显示设置 */}
        <Card>
          <CardHeader>
            <CardTitle>显示设置</CardTitle>
            <CardDescription>
              调整界面的显示效果和布局
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>启用动画效果</Label>
                  <p className="text-xs text-muted-foreground">界面切换和悬停动画</p>
                </div>
                <Button variant="outline" size="sm">
                  开启
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>毛玻璃效果</Label>
                  <p className="text-xs text-muted-foreground">工具栏背景模糊效果</p>
                </div>
                <Button variant="outline" size="sm">
                  开启
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                ⚠️ 显示设置功能即将推出
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 