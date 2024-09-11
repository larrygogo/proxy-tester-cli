# Proxy Tester CLI

代理测试工具，支持批量测试，将结果输出到文件

选项：
-p, --proxy 需要代理的地址，可以是文件路径 [字符串] [必需]
-d, --domain 需要测试的域名，可以是文件路径 [字符串] [必需]
-o, --output 测试结果输出的文件路径 [字符串]
-t, --timeout 超时时间[ms], 默认 3000ms [数字] [默认值: 3000]
-h, --help 显示帮助信息 [布尔]
-v, --version 显示版本号 [布尔]

示例：
proxy-tester-cli -p host:port:user:pass -d www.example.com

## --proxy

需要测试的代理

必填

支持格式：

```
# 单条代理
[https?://]host:port[:user:pass]
[https?://][user:pass@]host:port

# 文件路径（文件中每行一条代理，遵循单条代理格式）
./proxy.txt
```

## --domain

测试的域名地址

必填

支持格式：

```
# 单条域名
[https?://]domian

# 文件路径（文件中每行一条域名，遵循单条域名格式）
./domain.txt
```

## --output

结果输出的文件路径

./result.txt
