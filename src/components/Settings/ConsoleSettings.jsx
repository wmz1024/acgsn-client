import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Terminal, Send, Trash2, Keyboard } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export const ConsoleSettings = () => {
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [pendingCommand, setPendingCommand] = useState("");
  const [stdinInputs, setStdinInputs] = useState([""]);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // 自动滚动到底部
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // 添加输出到终端
  const addOutput = (text, type = "output") => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalOutput(prev => [...prev, {
      id: Date.now(),
      timestamp,
      text,
      type // "command", "output", "error", "stdin"
    }]);
  };

  // 执行普通命令
  const executeCommand = async (command) => {
    if (!command.trim()) return;

    setIsExecuting(true);
    addOutput(`> ${command}`, "command");

    try {
      const result = await invoke("execute_cmd_command", { command: command.trim() });
      
      if (result.output) {
        addOutput(result.output, "output");
      }
      
      if (!result.success && result.error) {
        addOutput(result.error, "error");
      }
    } catch (err) {
      addOutput(`错误: ${err}`, "error");
    } finally {
      setIsExecuting(false);
    }
  };

  // 执行交互式命令
  const executeInteractiveCommand = async (command, inputs) => {
    setIsExecuting(true);
    addOutput(`> ${command}`, "command");
    
    // 显示将要输入的数据
    inputs.forEach((input, index) => {
      if (input.trim()) {
        addOutput(`[输入 ${index + 1}] ${input}`, "stdin");
      }
    });

    try {
      const result = await invoke("execute_cmd_interactive_command", { 
        command: command.trim(), 
        inputs: inputs.filter(input => input.trim()) 
      });
      
      if (result.output) {
        addOutput(result.output, "output");
      }
      
      if (!result.success && result.error) {
        addOutput(result.error, "error");
      }
    } catch (err) {
      addOutput(`错误: ${err}`, "error");
    } finally {
      setIsExecuting(false);
    }
  };

  // 处理普通命令提交
  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentCommand.trim() && !isExecuting) {
      executeCommand(currentCommand);
      setCurrentCommand("");
    }
  };

  // 处理交互式命令
  const handleInteractiveSubmit = (e) => {
    e.preventDefault();
    if (currentCommand.trim() && !isExecuting) {
      setPendingCommand(currentCommand);
      setShowInputDialog(true);
      setCurrentCommand("");
    }
  };

  // 处理输入对话框确认
  const handleInputDialogConfirm = () => {
    const validInputs = stdinInputs.filter(input => input.trim());
    executeInteractiveCommand(pendingCommand, validInputs);
    setShowInputDialog(false);
    setPendingCommand("");
    setStdinInputs([""]);
  };

  // 添加新的输入行
  const addInputLine = () => {
    setStdinInputs(prev => [...prev, ""]);
  };

  // 更新输入行
  const updateInputLine = (index, value) => {
    setStdinInputs(prev => prev.map((input, i) => i === index ? value : input));
  };

  // 删除输入行
  const removeInputLine = (index) => {
    if (stdinInputs.length > 1) {
      setStdinInputs(prev => prev.filter((_, i) => i !== index));
    }
  };

  // 清空控制台
  const clearConsole = () => {
    setTerminalOutput([]);
  };

  // 处理键盘事件
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // 获取输出样式
  const getOutputStyle = (type) => {
    switch (type) {
      case "command":
        return "text-blue-400 font-medium";
      case "error":
        return "text-red-400";
      case "stdin":
        return "text-yellow-400";
      case "output":
      default:
        return "text-foreground";
    }
  };

  return (
    <div className="flex-1 p-6 overflow-hidden flex flex-col">
      <div className="max-w-4xl mx-auto space-y-6 flex-1 flex flex-col">
        {/* 页面标题 */}
        <div>
          <h1 className="text-2xl font-bold">控制台</h1>
          <p className="text-muted-foreground">内嵌的命令行终端，支持连续执行命令和标准输入</p>
        </div>

        {/* 终端窗口 */}
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                命令终端
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearConsole}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                清空
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            {/* 终端输出区域 */}
            <div
              ref={terminalRef}
              className="flex-1 bg-black text-green-400 p-4 rounded-md font-mono text-sm overflow-y-auto min-h-[400px] max-h-[500px]"
            >
              {terminalOutput.length === 0 ? (
                <div className="text-muted-foreground">
                  欢迎使用控制台。输入命令开始使用...
                </div>
              ) : (
                terminalOutput.map((item) => (
                  <div key={item.id} className="mb-1">
                    <span className="text-gray-500 text-xs mr-2">
                      [{item.timestamp}]
                    </span>
                    <span className={getOutputStyle(item.type)}>
                      {item.text}
                    </span>
                  </div>
                ))
              )}
              {isExecuting && (
                <div className="text-yellow-400">
                  正在执行命令...
                </div>
              )}
            </div>

            {/* 命令输入区域 */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={currentCommand}
                  onChange={(e) => setCurrentCommand(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入命令... (例如: dir, echo Hello World)"
                  disabled={isExecuting}
                  className="font-mono"
                />
              </div>
              <Button
                type="submit"
                disabled={isExecuting || !currentCommand.trim()}
                size="sm"
              >
                <Send className="w-4 h-4 mr-1" />
                执行
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleInteractiveSubmit}
                disabled={isExecuting || !currentCommand.trim()}
                size="sm"
              >
                <Keyboard className="w-4 h-4 mr-1" />
                交互式
              </Button>
            </form>

            {/* 使用说明 */}
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <div className="font-medium mb-1">使用说明:</div>
              <ul className="space-y-1 text-xs">
                <li>• 输入任何 Windows CMD 命令</li>
                <li>• 按 Enter 键或点击"执行"按钮运行普通命令</li>
                <li>• 点击"交互式"按钮运行需要标准输入的命令</li>
                <li>• 支持连续执行多个命令</li>
                <li>• 使用 "清空" 按钮清除终端历史</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 标准输入对话框 */}
        <Dialog open={showInputDialog} onOpenChange={setShowInputDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>标准输入 (stdin)</DialogTitle>
              <DialogDescription>
                为命令 "{pendingCommand}" 提供标准输入数据
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {stdinInputs.map((input, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`input-${index}`}>输入 {index + 1}</Label>
                    <Input
                      id={`input-${index}`}
                      value={input}
                      onChange={(e) => updateInputLine(index, e.target.value)}
                      placeholder={`第 ${index + 1} 行输入...`}
                    />
                  </div>
                  {stdinInputs.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeInputLine(index)}
                      className="mt-6"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addInputLine}
                size="sm"
              >
                添加输入行
              </Button>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowInputDialog(false)}>
                  取消
                </Button>
                <Button onClick={handleInputDialogConfirm}>
                  执行命令
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}; 