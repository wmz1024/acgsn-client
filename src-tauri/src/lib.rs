use std::fs;
use std::process::{Command, Stdio};
use std::io::Write;
use reqwest;
use tokio;
use tauri::Emitter;

#[derive(serde::Serialize)]
struct JavaCheckResult {
    installed: bool,
    version: Option<String>,
}

#[derive(serde::Serialize)]
struct CoreStatus {
    exists: bool,
    path: Option<String>,
    size: Option<u64>,
}

#[derive(serde::Serialize)]
struct DownloadProgress {
    downloaded: u64,
    total: Option<u64>,
    percentage: f64,
}

#[derive(serde::Serialize)]
struct CommandResult {
    success: bool,
    output: String,
    error: Option<String>,
}

// 检测Java版本
#[tauri::command]
async fn check_java_version() -> Result<JavaCheckResult, String> {
    let output = Command::new("java")
        .arg("-version")
        .output();

    match output {
        Ok(output) => {
            let stderr = String::from_utf8_lossy(&output.stderr);
            if stderr.is_empty() {
                return Ok(JavaCheckResult {
                    installed: false,
                    version: None,
                });
            }

            // 解析Java版本
            if let Some(version_line) = stderr.lines().next() {
                // 提取版本号 (例如: "openjdk version "17.0.1" 2021-10-19")
                if let Some(start) = version_line.find('"') {
                    if let Some(end) = version_line[start + 1..].find('"') {
                        let version_str = &version_line[start + 1..start + 1 + end];
                        
                        // 检查是否为Java 17及以上版本
                        if let Some(major_version) = version_str.split('.').next() {
                            if let Ok(major) = major_version.parse::<u32>() {
                                // 对于Java 1.8.x版本，我们认为不符合要求
                                let actual_major = if major == 1 {
                                    if let Some(minor) = version_str.split('.').nth(1) {
                                        minor.parse::<u32>().unwrap_or(8)
                                    } else { 8 }
                                } else { major };
                                
                                return Ok(JavaCheckResult {
                                    installed: actual_major >= 17,
                                    version: Some(version_str.to_string()),
                                });
                            }
                        }
                    }
                }
                
                Ok(JavaCheckResult {
                    installed: false,
                    version: Some(version_line.to_string()),
                })
            } else {
                Ok(JavaCheckResult {
                    installed: false,
                    version: None,
                })
            }
        }
        Err(_) => Ok(JavaCheckResult {
            installed: false,
            version: None,
        }),
    }
}

// 创建ACGS Network目录
#[tauri::command]
async fn create_acgs_directory() -> Result<String, String> {
    if let Some(docs_dir) = dirs::document_dir() {
        let acgs_dir = docs_dir.join("acgsnetwork");
        
        if !acgs_dir.exists() {
            fs::create_dir_all(&acgs_dir)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        }
        
        // 同时创建core目录
        let core_dir = acgs_dir.join("core");
        if !core_dir.exists() {
            fs::create_dir_all(&core_dir)
                .map_err(|e| format!("Failed to create core directory: {}", e))?;
        }
        
        Ok(acgs_dir.to_string_lossy().to_string())
    } else {
        Err("Could not find Documents directory".to_string())
    }
}

// 创建OOBE锁文件
#[tauri::command]
async fn create_oobe_lock() -> Result<(), String> {
    if let Some(docs_dir) = dirs::document_dir() {
        let lock_file = docs_dir.join("acgsnetwork").join("oobe.lock");
        
        fs::write(&lock_file, "OOBE completed")
            .map_err(|e| format!("Failed to create lock file: {}", e))?;
            
        Ok(())
    } else {
        Err("Could not find Documents directory".to_string())
    }
}

// 检查OOBE锁文件是否存在
#[tauri::command]
async fn check_oobe_completed() -> Result<bool, String> {
    if let Some(docs_dir) = dirs::document_dir() {
        let lock_file = docs_dir.join("acgsnetwork").join("oobe.lock");
        Ok(lock_file.exists())
    } else {
        Err("Could not find Documents directory".to_string())
    }
}

// 检查核心文件是否存在
#[tauri::command]
async fn check_core_exists() -> Result<CoreStatus, String> {
    if let Some(docs_dir) = dirs::document_dir() {
        let core_file = docs_dir.join("acgsnetwork").join("core").join("cmcl.jar");
        
        if core_file.exists() {
            let metadata = fs::metadata(&core_file)
                .map_err(|e| format!("Failed to read core file metadata: {}", e))?;
            
            Ok(CoreStatus {
                exists: true,
                path: Some(core_file.to_string_lossy().to_string()),
                size: Some(metadata.len()),
            })
        } else {
            Ok(CoreStatus {
                exists: false,
                path: None,
                size: None,
            })
        }
    } else {
        Err("Could not find Documents directory".to_string())
    }
}

// 获取核心文件路径
#[tauri::command]
async fn get_core_path() -> Result<String, String> {
    if let Some(docs_dir) = dirs::document_dir() {
        let core_dir = docs_dir.join("acgsnetwork").join("core");
        Ok(core_dir.to_string_lossy().to_string())
    } else {
        Err("Could not find Documents directory".to_string())
    }
}

// 下载核心文件
#[tauri::command]
async fn download_core(window: tauri::Window) -> Result<String, String> {
    let url = "https://static.v0.net.cn/cmcl.jar";
    
    // 确保目录存在
    if let Some(docs_dir) = dirs::document_dir() {
        let core_dir = docs_dir.join("acgsnetwork").join("core");
        if !core_dir.exists() {
            fs::create_dir_all(&core_dir)
                .map_err(|e| format!("Failed to create core directory: {}", e))?;
        }
        
        let core_file = core_dir.join("cmcl.jar");
        
        // 开始下载
        let client = reqwest::Client::new();
        let mut response = client.get(url)
            .send()
            .await
            .map_err(|e| format!("Failed to start download: {}", e))?;
            
        if !response.status().is_success() {
            return Err(format!("Download failed with status: {}", response.status()));
        }
        
        let total_size = response.content_length();
        let mut downloaded = 0u64;
        let mut file = tokio::fs::File::create(&core_file)
            .await
            .map_err(|e| format!("Failed to create file: {}", e))?;
            
        // 分块下载并发送进度
        while let Some(chunk) = response.chunk()
            .await
            .map_err(|e| format!("Failed to read chunk: {}", e))? {
            
            tokio::io::AsyncWriteExt::write_all(&mut file, &chunk)
                .await
                .map_err(|e| format!("Failed to write chunk: {}", e))?;
                
            downloaded += chunk.len() as u64;
            
            let percentage = if let Some(total) = total_size {
                (downloaded as f64 / total as f64) * 100.0
            } else {
                0.0
            };
            
            // 发送下载进度事件
            let progress = DownloadProgress {
                downloaded,
                total: total_size,
                percentage,
            };
            
            let _ = window.emit("download-progress", &progress);
        }
        
        // 确保文件写入完成
        tokio::io::AsyncWriteExt::flush(&mut file)
            .await
            .map_err(|e| format!("Failed to flush file: {}", e))?;
            
        Ok(core_file.to_string_lossy().to_string())
    } else {
        Err("Could not find Documents directory".to_string())
    }
}

// 打开Java下载页面
#[tauri::command]
async fn open_java_download() -> Result<(), String> {
    let url = "https://go.acgstation.com/acgsnjava.html";
    if let Err(e) = open::that(url) {
        return Err(format!("Failed to open URL: {}", e));
    }
    Ok(())
}

// 打开EULA页面
#[tauri::command]
async fn open_eula() -> Result<(), String> {
    let url = "https://go.acgstation.com/eula.html";
    if let Err(e) = open::that(url) {
        return Err(format!("Failed to open URL: {}", e));
    }
    Ok(())
}

// 执行cmcl命令
#[tauri::command]
async fn execute_cmcl_command(args: Vec<String>) -> Result<CommandResult, String> {
    // 获取cmcl.jar路径
    let core_status = check_core_exists().await?;
    if !core_status.exists {
        return Err("核心文件不存在，请先下载核心".to_string());
    }
    
    let core_path = core_status.path.ok_or("无法获取核心文件路径".to_string())?;
    
    // 构建命令参数，添加编码设置
    let mut cmd_args = vec![
        "-Dfile.encoding=UTF-8".to_string(),
        "-Dconsole.encoding=UTF-8".to_string(),
        "-jar".to_string(), 
        core_path
    ];
    cmd_args.extend(args);
    
    // 执行命令，设置环境变量
    let mut cmd = Command::new("java");
    cmd.args(&cmd_args);
    
    // 在Windows上设置代码页为UTF-8
    #[cfg(target_os = "windows")]
    {
        cmd.env("CHCP", "65001");
    }
    
    let output = cmd.output();
    
    match output {
        Ok(output) => {
            // 尝试使用UTF-8解码，如果失败则使用GBK（Windows中文编码）
            let stdout = if let Ok(utf8_str) = String::from_utf8(output.stdout.clone()) {
                utf8_str
            } else {
                // 在Windows上，如果UTF-8失败，尝试GBK编码
                #[cfg(target_os = "windows")]
                {
                    match encoding_rs::GBK.decode(&output.stdout).0.into_owned() {
                        decoded => decoded,
                    }
                }
                #[cfg(not(target_os = "windows"))]
                {
                    String::from_utf8_lossy(&output.stdout).to_string()
                }
            };
            
            let stderr = if let Ok(utf8_str) = String::from_utf8(output.stderr.clone()) {
                utf8_str
            } else {
                #[cfg(target_os = "windows")]
                {
                    match encoding_rs::GBK.decode(&output.stderr).0.into_owned() {
                        decoded => decoded,
                    }
                }
                #[cfg(not(target_os = "windows"))]
                {
                    String::from_utf8_lossy(&output.stderr).to_string()
                }
            };
            
            let success = output.status.success();
            let combined_output = if !stdout.is_empty() { stdout } else { stderr.clone() };
            
            Ok(CommandResult {
                success,
                output: combined_output,
                error: if success { None } else { Some(stderr) },
            })
        }
        Err(e) => Err(format!("执行命令失败: {}", e)),
    }
}

// 执行cmcl交互式命令（用于登录等需要用户输入的命令）
#[tauri::command]
async fn execute_cmcl_interactive_command(args: Vec<String>, _inputs: Vec<String>) -> Result<CommandResult, String> {
    // 获取cmcl.jar路径
    let core_status = check_core_exists().await?;
    if !core_status.exists {
        return Err("核心文件不存在，请先下载核心".to_string());
    }
    
    let core_path = core_status.path.ok_or("无法获取核心文件路径".to_string())?;
    
    // 构建完整的java命令
    let mut java_args = vec![
        "-Dfile.encoding=UTF-8".to_string(),
        "-Dconsole.encoding=UTF-8".to_string(),
        "-jar".to_string(), 
        core_path
    ];
    java_args.extend(args);
    
    let java_command = format!("java {}", java_args.join(" "));

    // 在新的CMD窗口中执行命令
    #[cfg(target_os = "windows")]
    {
        // 添加 `|| pause` 使得窗口在命令失败时保持打开
        let final_command = format!("{} || pause", java_command);
        
        let mut cmd = Command::new("cmd.exe");
        cmd.arg("/c")
           .arg("start")
           .arg("/wait") // 等待新窗口的进程结束
           .arg("cmd.exe")
           .arg("/c")
           .arg(&final_command);
        
        // 设置环境变量以确保正确的编码
        cmd.env("CHCP", "65001");
        
        let status = cmd.status().map_err(|e| format!("启动命令失败: {}", e))?;

        if status.success() {
            Ok(CommandResult {
                success: true,
                output: "登录过程已完成。".to_string(),
                error: None,
            })
        } else {
            Err(format!("登录过程失败，退出码: {:?}", status.code()))
        }
    }

    // 为macOS和Linux提供备用实现
    #[cfg(not(target_os = "windows"))]
    {
        // ... (可以添加macOS/Linux的实现, 例如使用gnome-terminal或xterm)
        Err("此功能目前仅在Windows上受支持".to_string())
    }
}

// 执行CMD命令（用于控制台）
#[tauri::command]
async fn execute_cmd_command(command: String) -> Result<CommandResult, String> {
    // 在Windows上执行CMD命令
    #[cfg(target_os = "windows")]
    {
        let mut cmd = Command::new("cmd.exe");
        cmd.arg("/c")
           .arg(&command)
           .stdout(Stdio::piped())
           .stderr(Stdio::piped());
        
        // 设置环境变量以确保正确的编码
        cmd.env("CHCP", "65001");
        
        let output = cmd.output().map_err(|e| format!("执行命令失败: {}", e))?;
        
        // 尝试使用UTF-8解码，如果失败则使用GBK（Windows中文编码）
        let stdout = if let Ok(utf8_str) = String::from_utf8(output.stdout.clone()) {
            utf8_str
        } else {
            #[cfg(target_os = "windows")]
            {
                match encoding_rs::GBK.decode(&output.stdout).0.into_owned() {
                    decoded => decoded,
                }
            }
            #[cfg(not(target_os = "windows"))]
            {
                String::from_utf8_lossy(&output.stdout).to_string()
            }
        };
        
        let stderr = if let Ok(utf8_str) = String::from_utf8(output.stderr.clone()) {
            utf8_str
        } else {
            #[cfg(target_os = "windows")]
            {
                match encoding_rs::GBK.decode(&output.stderr).0.into_owned() {
                    decoded => decoded,
                }
            }
            #[cfg(not(target_os = "windows"))]
            {
                String::from_utf8_lossy(&output.stderr).to_string()
            }
        };
        
        let success = output.status.success();
        let combined_output = if !stdout.is_empty() { 
            stdout 
        } else if !stderr.is_empty() { 
            stderr.clone() 
        } else { 
            "命令执行完成".to_string() 
        };
        
        Ok(CommandResult {
            success,
            output: combined_output,
            error: if success { None } else { Some(stderr) },
        })
    }

    // 为macOS和Linux提供备用实现
    #[cfg(not(target_os = "windows"))]
    {
        let mut cmd = Command::new("sh");
        cmd.arg("-c")
           .arg(&command)
           .stdout(Stdio::piped())
           .stderr(Stdio::piped());
        
        let output = cmd.output().map_err(|e| format!("执行命令失败: {}", e))?;
        
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        
        let success = output.status.success();
        let combined_output = if !stdout.is_empty() { 
            stdout 
        } else if !stderr.is_empty() { 
            stderr.clone() 
        } else { 
            "命令执行完成".to_string() 
        };
        
        Ok(CommandResult {
            success,
            output: combined_output,
            error: if success { None } else { Some(stderr) },
        })
    }
}

// 执行交互式CMD命令（支持stdin输入）
#[tauri::command]
async fn execute_cmd_interactive_command(command: String, inputs: Vec<String>) -> Result<CommandResult, String> {
    // 在Windows上执行CMD命令
    #[cfg(target_os = "windows")]
    {
        let mut cmd = Command::new("cmd.exe");
        cmd.arg("/c")
           .arg(&command)
           .stdin(Stdio::piped())
           .stdout(Stdio::piped())
           .stderr(Stdio::piped());
        
        // 设置环境变量以确保正确的编码
        cmd.env("CHCP", "65001");
        
        let mut child = cmd.spawn().map_err(|e| format!("启动命令失败: {}", e))?;
        
        // 如果有输入数据，写入stdin
        if !inputs.is_empty() {
            if let Some(mut stdin) = child.stdin.take() {
                use std::io::Write;
                for input in inputs {
                    writeln!(stdin, "{}", input).map_err(|e| format!("写入输入失败: {}", e))?;
                }
                drop(stdin); // 关闭stdin，让程序知道输入结束
            }
        }
        
        let output = child.wait_with_output().map_err(|e| format!("等待命令完成失败: {}", e))?;
        
        // 尝试使用UTF-8解码，如果失败则使用GBK（Windows中文编码）
        let stdout = if let Ok(utf8_str) = String::from_utf8(output.stdout.clone()) {
            utf8_str
        } else {
            match encoding_rs::GBK.decode(&output.stdout).0.into_owned() {
                decoded => decoded,
            }
        };
        
        let stderr = if let Ok(utf8_str) = String::from_utf8(output.stderr.clone()) {
            utf8_str
        } else {
            match encoding_rs::GBK.decode(&output.stderr).0.into_owned() {
                decoded => decoded,
            }
        };
        
        let success = output.status.success();
        let combined_output = if !stdout.is_empty() { 
            stdout 
        } else if !stderr.is_empty() { 
            stderr.clone() 
        } else { 
            "命令执行完成".to_string() 
        };
        
        Ok(CommandResult {
            success,
            output: combined_output,
            error: if success { None } else { Some(stderr) },
        })
    }

    // 为macOS和Linux提供备用实现
    #[cfg(not(target_os = "windows"))]
    {
        let mut cmd = Command::new("sh");
        cmd.arg("-c")
           .arg(&command)
           .stdin(Stdio::piped())
           .stdout(Stdio::piped())
           .stderr(Stdio::piped());
        
        let mut child = cmd.spawn().map_err(|e| format!("启动命令失败: {}", e))?;
        
        // 如果有输入数据，写入stdin
        if !inputs.is_empty() {
            if let Some(mut stdin) = child.stdin.take() {
                use std::io::Write;
                for input in inputs {
                    writeln!(stdin, "{}", input).map_err(|e| format!("写入输入失败: {}", e))?;
                }
                drop(stdin);
            }
        }
        
        let output = child.wait_with_output().map_err(|e| format!("等待命令完成失败: {}", e))?;
        
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        
        let success = output.status.success();
        let combined_output = if !stdout.is_empty() { 
            stdout 
        } else if !stderr.is_empty() { 
            stderr.clone() 
        } else { 
            "命令执行完成".to_string() 
        };
        
        Ok(CommandResult {
            success,
            output: combined_output,
            error: if success { None } else { Some(stderr) },
        })
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            check_java_version,
            create_acgs_directory,
            create_oobe_lock,
            check_oobe_completed,
            check_core_exists,
            get_core_path,
            download_core,
            open_java_download,
            open_eula,
            execute_cmcl_command,
            execute_cmcl_interactive_command,
            execute_cmd_command,
            execute_cmd_interactive_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
