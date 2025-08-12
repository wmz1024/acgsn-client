import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export const useAccount = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [availableServers, setAvailableServers] = useState([
    { name: "ACGS", address: "id.acgstation.com" },
    { name: "JB Wiki", address: "id.jb.wiki" }
  ]);

  // 检查cmcl.jar是否存在
  const checkCoreExists = async () => {
    try {
      const status = await invoke("check_core_exists");
      return status?.exists || false;
    } catch (err) {
      console.error("检查核心失败:", err);
      setError("检查核心失败: " + err);
      return false;
    }
  };

  // 执行cmcl命令
  const executeCmclCommand = async (args) => {
    try {
      setError("");
      console.log("🚀 执行CMCL命令:", "java -jar cmcl.jar", args.join(" "));
      const result = await invoke("execute_cmcl_command", { args });
      console.log("📋 命令执行结果:", result);
      console.log("📄 命令输出:", result.output);
      return result;
    } catch (err) {
      console.error("❌ 执行命令失败:", err);
      setError("执行命令失败: " + err);
      throw err;
    }
  };

  // 执行cmcl交互式命令
  const executeCmclInteractiveCommand = async (args, inputs) => {
    try {
      setError("");
      console.log("🚀 执行CMCL交互式命令:", "java -jar cmcl.jar", args.join(" "));
      console.log("📝 准备输入:", inputs);
      const result = await invoke("execute_cmcl_interactive_command", { args, inputs });
      console.log("📋 命令执行结果:", result);
      console.log("📄 命令输出:", result.output);
      return result;
    } catch (err) {
      console.error("执行交互式命令失败:", err);
      setError("执行交互式命令失败: " + err);
      throw err;
    }
  };

  // 获取账户列表
  const getAccountList = async () => {
    console.log("🔄 开始获取账户列表...");
    setIsLoading(true);
    try {
      console.log("🔍 检查核心文件是否存在...");
      const coreExists = await checkCoreExists();
      if (!coreExists) {
        throw new Error("核心文件不存在，请先下载核心");
      }
      console.log("✅ 核心文件存在");

      console.log("🚀 执行获取账户列表命令...");
      const result = await executeCmclCommand(["account", "--list"]);
      
      // 解析输出，提取账户信息
      console.log("🔍 开始解析账户数据...");
      const accountData = parseAccountList(result.output);
      console.log("📊 设置账户数据:", accountData);
      setAccounts(accountData);
      
      return accountData;
    } catch (err) {
      console.error("❌ 获取账户列表失败:", err);
      setError("获取账户列表失败: " + err);
      return [];
    } finally {
      setIsLoading(false);
      console.log("✅ 获取账户列表操作完成");
    }
  };

  // 解析账户列表输出
  const parseAccountList = (output) => {
    console.log("🔍 开始解析账户列表输出...");
    console.log("📄 原始输出:", output);
    
    if (!output) {
      console.log("❌ 输出为空");
      return [];
    }
    
    try {
      const lines = output.split('\n').filter(line => line.trim());
      console.log("📋 分割后的行数:", lines.length);
      console.log("📋 所有行:", lines);
      
      const accounts = [];
      let separatorCount = 0;
      let inDataSection = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        console.log(`🔍 处理第${i}行:`, line);
        
        // 检测表格分隔符（水平线）
        if (line.includes('+----+----+')) {
          separatorCount++;
          console.log(`📍 检测到第${separatorCount}个表格分隔符`);
          
          if (separatorCount === 2) {
            // 第二个分隔符后开始数据区域
            inDataSection = true;
            console.log("📍 进入数据区域");
          } else if (separatorCount === 3) {
            // 第三个分隔符表示表格结束
            inDataSection = false;
            console.log("📍 表格结束");
            break;
          }
          continue;
        }
        
        // 解析数据行
        if (inDataSection && line.startsWith('|')) {
          console.log("🔍 解析数据行:", line);
          const parts = line.split('|').map(part => part.trim());
          console.log("🔍 分割后的部分:", parts);
          
          if (parts.length >= 6) {
            const selected = parts[1] !== '' && parts[1] !== '选' && parts[1] !== '择';  // 已选择列不为空且不是表头
            const id = parseInt(parts[2]) || 0;  // 序号
            const name = parts[3];  // 名称
            const accountType = parts[4];  // 账号类型
            const otherInfo = parts[5];  // 其他信息
            
            console.log("🔍 解析的字段:", { selected, id, name, accountType, otherInfo });
            
            // 排除表头和空行
            if (name && name !== '名称' && name !== '' && !isNaN(id) && id >= 0) {
              // 从其他信息中提取服务器地址
              let server = "未知";
              if (otherInfo && otherInfo.includes('https://')) {
                const match = otherInfo.match(/https:\/\/([^\/]+)/);
                if (match) {
                  server = match[1];
                }
              }
              
              // 如果当前行的其他信息不完整，尝试查找下一行
              let completeOtherInfo = otherInfo;
              if (i + 1 < lines.length) {
                const nextLine = lines[i + 1];
                if (nextLine.startsWith('|') && nextLine.includes('api/yggdrasil')) {
                  const nextParts = nextLine.split('|').map(part => part.trim());
                  if (nextParts.length >= 6 && nextParts[5]) {
                    completeOtherInfo = otherInfo + ' ' + nextParts[5];
                    // 重新提取服务器地址
                    if (completeOtherInfo.includes('https://')) {
                      const match = completeOtherInfo.match(/https:\/\/([^\/]+)/);
                      if (match) {
                        server = match[1];
                      }
                    }
                  }
                }
              }
              
              const account = {
                id: id,
                name: name,
                type: accountType === "外置账号" ? "authlib" : accountType,
                server: server,
                selected: selected,
                rawInfo: completeOtherInfo
              };
              
              console.log("✅ 添加账户:", account);
              accounts.push(account);
            }
          }
        }
      }
      
      console.log("🎉 解析完成，共找到", accounts.length, "个账户:", accounts);
      return accounts;
    } catch (err) {
      console.error("❌ 解析账户列表失败:", err);
      return [];
    }
  };

  // 选择账户
  const selectAccount = async (accountId) => {
    setIsLoading(true);
    try {
      const result = await executeCmclCommand(["account", "-s", accountId.toString()]);
      
      // 更新本地状态
      setAccounts(prev => prev.map(acc => ({
        ...acc,
        selected: acc.id === accountId
      })));
      
      const selected = accounts.find(acc => acc.id === accountId);
      setSelectedAccount(selected);
      
      return result;
    } catch (err) {
      console.error("选择账户失败:", err);
      setError("选择账户失败: " + err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 删除账户
  const deleteAccount = async (accountId) => {
    setIsLoading(true);
    try {
      const result = await executeCmclCommand(["account", "--delete", accountId.toString()]);
      
      // 更新本地状态
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      
      if (selectedAccount && selectedAccount.id === accountId) {
        setSelectedAccount(null);
      }
      
      return result;
    } catch (err) {
      console.error("删除账户失败:", err);
      setError("删除账户失败: " + err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新当前账户
  const refreshCurrentAccount = async () => {
    setIsLoading(true);
    try {
      const result = await executeCmclCommand(["account", "--refresh"]);
      
      // 重新获取账户列表
      await getAccountList();
      
      return result;
    } catch (err) {
      console.error("刷新账户失败:", err);
      setError("刷新账户失败: " + err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 外置登录
  const loginAuthlib = async (serverAddress, username, password) => {
    setIsLoading(true);
    try {
      const coreExists = await checkCoreExists();
      if (!coreExists) {
        throw new Error("核心文件不存在，请先下载核心");
      }

      const isValidServer = availableServers.some(server => server.address === serverAddress);
      if (!isValidServer) {
        throw new Error("不支持的服务器地址");
      }

      const inputs = [username, password || ""];
      
      const result = await executeCmclInteractiveCommand([
        "account", 
        "--login=authlib", 
        `--address=${serverAddress}`,
        "-s"
      ], inputs);

      if (result.success) {
        // 命令成功后立即刷新
        await getAccountList();
      } else {
        throw new Error(result.error || "登录过程失败");
      }
      
    } catch (err) {
      console.error("外置登录失败:", err);
      setError("外置登录失败: " + err.toString());
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 添加自定义服务器
  const addCustomServer = (name, address) => {
    const newServer = { name, address };
    setAvailableServers(prev => [...prev, newServer]);
    
    // 保存到本地存储
    try {
      const savedServers = JSON.parse(localStorage.getItem("custom_servers") || "[]");
      savedServers.push(newServer);
      localStorage.setItem("custom_servers", JSON.stringify(savedServers));
    } catch (err) {
      console.error("保存自定义服务器失败:", err);
    }
  };

  // 删除自定义服务器
  const removeCustomServer = (address) => {
    setAvailableServers(prev => prev.filter(server => server.address !== address));
    
    // 从本地存储删除
    try {
      const savedServers = JSON.parse(localStorage.getItem("custom_servers") || "[]");
      const filtered = savedServers.filter(server => server.address !== address);
      localStorage.setItem("custom_servers", JSON.stringify(filtered));
    } catch (err) {
      console.error("删除自定义服务器失败:", err);
    }
  };

  // 初始化
  useEffect(() => {
    // 加载自定义服务器
    try {
      const savedServers = JSON.parse(localStorage.getItem("custom_servers") || "[]");
      if (savedServers.length > 0) {
        setAvailableServers(prev => [...prev, ...savedServers]);
      }
    } catch (err) {
      console.error("加载自定义服务器失败:", err);
    }

    // 初始获取账户列表
    getAccountList();
  }, []);

  // 当账户列表更新时，同步更新选中的账户
  useEffect(() => {
    const currentSelected = accounts.find(acc => acc.selected);
    setSelectedAccount(currentSelected || null);
  }, [accounts]);

  return {
    // 状态
    accounts,
    selectedAccount,
    isLoading,
    error,
    availableServers,
    
    // 方法
    getAccountList,
    selectAccount,
    deleteAccount,
    refreshCurrentAccount,
    loginAuthlib,
    addCustomServer,
    removeCustomServer,
    checkCoreExists,
    
    // 工具方法
    setError
  };
}; 