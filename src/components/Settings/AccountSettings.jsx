import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { 
  User, 
  LogIn, 
  LogOut, 
  Trash2, 
  RefreshCw, 
  Plus, 
  Server, 
  AlertTriangle, 
  CheckCircle2,
  Loader2,
  Settings
} from "lucide-react";
import { useAccount } from "../../hooks/useAccount";
import { useEffect } from "react";

export const AccountSettings = () => {
  const account = useAccount();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showAddServerDialog, setShowAddServerDialog] = useState(false);
  const [loginForm, setLoginForm] = useState({
    server: ""
  });
  const [serverForm, setServerForm] = useState({
    name: "",
    address: ""
  });

  useEffect(() => {
    account.refreshCurrentAccount();
  }, []);

  // 处理登录
  const handleLogin = async () => {
    if (!loginForm.server) {
      account.setError("请选择一个服务器");
      return;
    }

    try {
      // Since username and password are not collected here, pass empty strings
      await account.loginAuthlib(loginForm.server, "", "");
      setShowLoginDialog(false);
      setLoginForm({ server: "" });
    } catch (err) {
      // 错误由hook处理
    }
  };

  // 处理添加服务器
  const handleAddServer = () => {
    if (!serverForm.name || !serverForm.address) {
      account.setError("请填写完整的服务器信息");
      return;
    }

    account.addCustomServer(serverForm.name, serverForm.address);
    setShowAddServerDialog(false);
    setServerForm({ name: "", address: "" });
  };

  // 获取账户状态图标
  const getAccountStatusIcon = (acc) => {
    if (acc.selected) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    return <User className="w-4 h-4 text-muted-foreground" />;
  };

  // 是否可以删除服务器
  const canDeleteServer = (address) => {
    return !["id.acgstation.com", "id.jb.wiki"].includes(address);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-2xl font-bold">账户管理</h1>
          <p className="text-muted-foreground">管理您的Minecraft账户和外置登录服务器</p>
        </div>

        {/* 当前账户 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              当前账户
            </CardTitle>
            <CardDescription>
              当前选择的游戏账户信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            {account.isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <span className="ml-3 text-muted-foreground">正在加载账户信息...</span>
              </div>
            ) : account.selectedAccount ? (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium">{account.selectedAccount.name}</div>
                    <div className="text-sm text-muted-foreground">
                      外置登录 • {account.selectedAccount.server}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={account.refreshCurrentAccount}
                    disabled={account.isLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${account.isLoading ? 'animate-spin' : ''}`} />
                    刷新
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无选择的账户</p>
                <p className="text-sm">请登录或选择一个账户</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 账户列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  账户列表
                </CardTitle>
                <CardDescription>
                  管理所有已保存的账户
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={account.getAccountList}
                  disabled={account.isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${account.isLoading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
                <Button size="sm" onClick={() => setShowLoginDialog(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加账户
                </Button>
                <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>外置登录</DialogTitle>
                      <DialogDescription>
                        使用外置登录服务器添加新账户
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="server">服务器</Label>
                        <select
                          id="server"
                          className="w-full p-2 border rounded-md"
                          value={loginForm.server}
                          onChange={(e) => setLoginForm({ server: e.target.value })}
                        >
                          <option value="">选择服务器</option>
                          {account.availableServers.map((server) => (
                            <option key={server.address} value={server.address}>
                              {server.name} ({server.address})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowLoginDialog(false)}>
                          取消
                        </Button>
                        <Button onClick={handleLogin} disabled={account.isLoading}>
                          {account.isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          登录
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {account.accounts.length > 0 ? (
              <div className="space-y-2">
                {account.accounts.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getAccountStatusIcon(acc)}
                      <div>
                        <div className="font-medium">{acc.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {acc.type === "authlib" ? "外置登录" : acc.type} • {acc.server}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!acc.selected && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => account.selectAccount(acc.id)}
                          disabled={account.isLoading}
                        >
                          选择
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => account.deleteAccount(acc.id)}
                        disabled={account.isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <LogOut className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无账户</p>
                <p className="text-sm">点击添加账户按钮开始使用</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 服务器管理 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  服务器管理
                </CardTitle>
                <CardDescription>
                  管理外置登录服务器地址
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowAddServerDialog(true)}>
                <Plus className="w-4 h-4 mr-1" />
                添加服务器
              </Button>
              <Dialog open={showAddServerDialog} onOpenChange={setShowAddServerDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>添加自定义服务器</DialogTitle>
                    <DialogDescription>
                      添加新的外置登录服务器地址
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="serverName">服务器名称</Label>
                      <Input
                        id="serverName"
                        placeholder="如：我的服务器"
                        value={serverForm.name}
                        onChange={(e) => setServerForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="serverAddress">服务器地址</Label>
                      <Input
                        id="serverAddress"
                        placeholder="如：auth.example.com"
                        value={serverForm.address}
                        onChange={(e) => setServerForm(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddServerDialog(false)}>
                        取消
                      </Button>
                      <Button onClick={handleAddServer}>
                        添加
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {account.availableServers.map((server) => (
                <div key={server.address} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Server className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{server.name}</div>
                      <div className="text-sm text-muted-foreground">{server.address}</div>
                    </div>
                  </div>
                  {canDeleteServer(server.address) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => account.removeCustomServer(server.address)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 错误信息 */}
        {account.error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-start gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">操作失败</div>
                  <div className="text-sm mt-1">{account.error}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 使用说明 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              使用说明
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              <div className="font-medium text-foreground mb-1">• 外置登录</div>
              <div>本客户端仅支持外置登录方式，当前支持 ACGS 和 JB Wiki 服务器。</div>
            </div>
            <div>
              <div className="font-medium text-foreground mb-1">• 账户管理</div>
              <div>您可以添加多个账户，但同时只能选择一个账户用于游戏。</div>
            </div>
            <div>
              <div className="font-medium text-foreground mb-1">• 自定义服务器</div>
              <div>支持添加自定义的外置登录服务器，但请确保服务器支持标准的 AuthLib 协议。</div>
            </div>
            <div>
              <div className="font-medium text-foreground mb-1">• 注意事项</div>
              <div>请确保已下载游戏核心文件，否则无法进行账户操作。</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 