---
title: npm-cache文件夹下的log文件
---

npm-cache 文件夹下的 log 文件是 npm 缓存管理的一部分,它记录了 npm 在缓存管理过程中的日志信息。

具体来说,log 文件记录了以下几类信息:

## npm prefix --global 日志

当 npm 执行 命令或主动调用 npm prefix --global命令时，会记录相关的加载配置到执行命令的操作过程和状态

以下是对日志的详细分析：

### 日志概述

- 工具：npm 9.6.7
- Node.js 版本：v18.17.1
- 命令：npm prefix --global
- 执行时间：约 29 毫秒
- 退出状态：0（成功）

### 详细分析

- CLI 命令执行：

```python
0 verbose cli d:\Program Files\nodejs\node.exe d:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js
```

使用了 node 和 npm-cli.js 来执行 npm 命令。

- npm 版本和 Node.js 版本：

```sql
1 info using npm@9.6.7
2 info using node@v18.17.1
```

- npm 配置加载：

```lua
3 timing npm:load:whichnode Completed in 1ms
4 timing config:load:defaults Completed in 1ms
5 timing config:load:file:D:\software\nvm\v18.17.1\node_modules\npm\npmrc Completed in 0ms
6 timing config:load:builtin Completed in 0ms
7 timing config:load:cli Completed in 2ms
8 timing config:load:env Completed in 0ms
9 timing config:load:project Completed in 2ms
10 timing config:load:file:C:\Users\xiuer\.npmrc Completed in 1ms
11 timing config:load:user Completed in 1ms
12 timing config:load:file:d:\Program Files\nodejs\etc\npmrc Completed in 0ms
13 timing config:load:global Completed in 0ms
14 timing config:load:setEnvs Completed in 1ms
15 timing config:load Completed in 8ms
16 timing npm:load:configload Completed in 8ms
```

配置加载过程包括默认配置、项目配置、用户配置和全局配置等，整个加载过程花费了约 8 毫秒。

- 创建缓存和日志目录：

```lua
17 timing npm:load:mkdirpcache Completed in 0ms
18 timing npm:load:mkdirplogs Completed in 0ms
```

- 命令参数和标题：

```swift
19 verbose title npm prefix
20 verbose argv "prefix" "--global"
```

- 日志文件路径：

```lua
24 verbose logfile logs-max:10 dir:C:\Users\xiuer\AppData\Local\npm-cache\_logs\2024-07-25T07_39_25_363Z-
25 verbose logfile C:\Users\xiuer\AppData\Local\npm-cache\_logs\2024-07-25T07_39_25_363Z-debug-0.log
```

- 加载计时和范围配置：

```lua
26 timing npm:load:logFile Completed in 7ms
27 timing npm:load:timers Completed in 0ms
28 timing npm:load:configScope Completed in 1ms
29 timing npm:load Completed in 21ms
```

- 命令执行和完成：

```bash
30 timing command:prefix Completed in 1ms
31 verbose exit 0
32 timing npm Completed in 29ms
33 info ok
```

## 缓存管理日志:

当 npm 执行 npm cache clean、npm cache verify 等缓存管理命令时,会记录相关的操作过程和状态。

以下是对日志的详细分析：

### 日志概述

- 工具：npm 9.6.7
- Node.js 版本：v18.17.1
- 命令：npm cache clean --force
- 执行时间：约 3.146 秒
- 退出状态：0（成功）

### 详细分析

- CLI 命令执行：

```python
0 verbose cli d:\Program Files\nodejs\node.exe d:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js
```

使用了 node 和 npm-cli.js 来执行 npm 命令。

- npm 版本和 Node.js 版本：

```sql
1 info using npm@9.6.7
2 info using node@v18.17.1
```
- npm 配置加载：

```lua
3 timing npm:load:whichnode Completed in 2ms
4 timing config:load:defaults Completed in 1ms
5 timing config:load:file:D:\software\nvm\v18.17.1\node_modules\npm\npmrc Completed in 1ms
6 timing config:load:builtin Completed in 1ms
7 timing config:load:cli Completed in 2ms
8 timing config:load:env Completed in 0ms
9 timing config:load:file:D:\projects\woke-projects\blog_new\source\_drafts\运维\2_系统管理 (3-4 周)\2.4_日志分析与监控\cache\.npmrc Completed in 0ms
10 timing config:load:project Completed in 4ms
11 timing config:load:file:C:\Users\xiuer\.npmrc Completed in 0ms
12 timing config:load:user Completed in 1ms
13 timing config:load:file:d:\Program Files\nodejs\etc\npmrc Completed in 0ms
14 timing config:load:global Completed in 0ms
15 timing config:load:setEnvs Completed in 1ms
16 timing config:load Completed in 10ms
17 timing npm:load:configload Completed in 10ms
```

配置加载过程包括默认配置、项目配置、用户配置和全局配置等，整个加载过程花费了约 10 毫秒。

- 创建缓存和日志目录：

```lua
18 timing npm:load:mkdirpcache Completed in 0ms
19 timing npm:load:mkdirplogs Completed in 0ms
```

- 命令参数和标题：

```arduino
20 verbose title npm cache clean
21 verbose argv "cache" "clean" "--force"
```

具体命令是 npm cache clean --force。

- 日志文件路径：

```lua
25 verbose logfile logs-max:10 dir:C:\Users\xiuer\AppData\Local\npm-cache\_logs\2024-07-25T08_22_25_943Z-
26 verbose logfile C:\Users\xiuer\AppData\Local\npm-cache\_logs\2024-07-25T08_22_25_943Z-debug-0.log
```

- 警告信息：
```scss
30 warn using --force Recommended protections disabled.
```

使用了 --force 参数，禁用了推荐的保护措施。

- 命令执行和完成：

```bash
31 timing npm:load Completed in 24ms
32 silly logfile done cleaning log files
33 timing command:cache Completed in 2928ms
34 verbose exit 0
35 timing npm Completed in 3146ms
36 info ok
```

命令执行成功，总共花费了约 3.146 秒。

## 错误日志:

如果在缓存管理过程中出现任何错误,也会被记录在 log 文件中。

以下是对日志的详细分析：

### 日志概述

- 工具：npm 9.6.7
- Node.js 版本：v18.17.1
- 命令：npm cache clean
- 执行时间：约 224 毫秒
- 退出状态：1（失败）

### 详细分析

- CLI 命令执行：

```python
0 verbose cli d:\Program Files\nodejs\node.exe d:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js
```

使用了 node 和 npm-cli.js 来执行 npm 命令。

- npm 版本和 Node.js 版本：

```sql
1 info using npm@9.6.7
2 info using node@v18.17.1
```

- npm 配置加载：

```lua
3 timing npm:load:whichnode Completed in 1ms
4 timing config:load:defaults Completed in 1ms
5 timing config:load:file:D:\software\nvm\v18.17.1\node_modules\npm\npmrc Completed in 0ms
6 timing config:load:builtin Completed in 0ms
7 timing config:load:cli Completed in 2ms
8 timing config:load:env Completed in 0ms
9 timing config:load:file:D:\projects\woke-projects\blog_new\source\_drafts\运维\2_系统管理 (3-4 周)\2.4_日志分析与监控\cache\.npmrc Completed in 0ms
10 timing config:load:project Completed in 4ms
11 timing config:load:file:C:\Users\xiuer\.npmrc Completed in 0ms
12 timing config:load:user Completed in 1ms
13 timing config:load:file:d:\Program Files\nodejs\etc\npmrc Completed in 0ms
14 timing config:load:global Completed in 0ms
15 timing config:load:setEnvs Completed in 0ms
16 timing config:load Completed in 8ms
17 timing npm:load:configload Completed in 8ms
```

- 创建缓存和日志目录：

```lua
18 timing npm:load:mkdirpcache Completed in 1ms
19 timing npm:load:mkdirplogs Completed in 0ms
```

- 命令参数和标题：

```arduino
20 verbose title npm cache clean
21 verbose argv "cache" "clean"
```

- 日志文件路径：

```lua
25 verbose logfile logs-max:10 dir:C:\Users\xiuer\AppData\Local\npm-cache\_logs\2024-07-25T08_28_13_411Z-
26 verbose logfile C:\Users\xiuer\AppData\Local\npm-cache\_logs\2024-07-25T08_28_13_411Z-debug-0.log
```

- 命令执行和失败原因：

```vbnet
30 timing npm:load Completed in 22ms
31 timing command:cache Completed in 0ms
32 verbose stack Error: As of npm@5, the npm cache self-heals from corruption issues
32 verbose stack   by treating integrity mismatches as cache misses.  As a result,
32 verbose stack   data extracted from the cache is guaranteed to be valid.  If you
32 verbose stack   want to make sure everything is consistent, use `npm cache verify`
32 verbose stack   instead.  Deleting the cache can only make npm go slower, and is
32 verbose stack   not likely to correct any problems you may be encountering!
32 verbose stack
32 verbose stack   On the other hand, if you're debugging an issue with the installer,
32 verbose stack   or race conditions that depend on the timing of writing to an empty
32 verbose stack   cache, you can use `npm install --cache /tmp/empty-cache` to use a
32 verbose stack   temporary cache instead of nuking the actual one.
32 verbose stack
32 verbose stack   If you're sure you want to delete the entire cache, rerun this command
32 verbose stack   with --force.
32 verbose stack     at Cache.clean (D:\software\nvm\v18.17.1\node_modules\npm\lib\commands\cache.js:113:15)
32 verbose stack     at Cache.exec (D:\software\nvm\v18.17.1\node_modules\npm\lib\commands\cache.js:96:27)
32 verbose stack     at Cache.cmdExec (D:\software\nvm\v18.17.1\node_modules\npm\lib\base-command.js:130:17)
32 verbose stack     at Npm.exec (D:\software\nvm\v18.17.1\node_modules\npm\lib\npm.js:168:20)
32 verbose stack     at async module.exports (D:\software\nvm\v18.17.1\node_modules\npm\lib\cli.js:89:5)
```

错误信息指出，从 npm@5 开始，npm 缓存可以自我修复，处理完整性不匹配时会将其视为缓存未命中。因此，删除缓存只会使 npm 运行得更慢，而且不太可能解决遇到的问题。
如果确定要删除整个缓存，请使用 --force 重新运行此命令。

- 工作目录和环境信息：

```bash
33 verbose cwd D:\projects\woke-projects\blog_new\source\_drafts\运维\2_系统管理 (3-4 周)\2.4_日志分析与监控\cache
34 verbose Windows_NT 10.0.22631
35 verbose node v18.17.1
36 verbose npm  v9.6.7
```

- 错误信息总结：

```vbnet
37 error As of npm@5, the npm cache self-heals from corruption issues
37 error   by treating integrity mismatches as cache misses.  As a result,
37 error   data extracted from the cache is guaranteed to be valid.  If you
37 error   want to make sure everything is consistent, use `npm cache verify`
37 error   instead.  Deleting the cache can only make npm go slower, and is
37 error   not likely to correct any problems you may be encountering!
37 error
37 error   On the other hand, if you're debugging an issue with the installer,
37 error   or race conditions that depend on the timing of writing to an empty
37 error   cache, you can use `npm install --cache /tmp/empty-cache` to use a
37 error   temporary cache instead of nuking the actual one.
37 error
37 error   If you're sure you want to delete the entire cache, rerun this command
37 error   with --force.
```

- 退出状态和日志路径：

```lua
38 verbose exit 1
39 timing npm Completed in 224ms
40 verbose code 1
41 error A complete log of this run can be found in: C:\Users\xiuer\AppData\Local\npm-cache\_logs\2024-07-25T08_28_13_411Z-debug-0.log
```


## 安装日志日志

以安装 jqueyry 为例

### 日志概述

- 工具：npm 9.6.7
- Node.js 版本：v18.17.1
- 命令：npm i jquery
- 安装时间：约 64 秒
- 退出状态：0（成功）

### 详细分析

- CLI 命令执行：

```python
0 verbose cli d:\Program Files\nodejs\node.exe d:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js
```

- npm 版本和 Node.js 版本：

```sql
1 info using npm@9.6.7
2 info using node@v18.17.1
```

- 配置加载和初始化：

```lua
3 timing npm:load:whichnode Completed in 1ms
...
30 timing npm:load Completed in 22ms
```

npm 的配置加载和初始化过程花费了 22 毫秒。

- 命令参数和标题：

```arduino
20 verbose title npm i jquery
21 verbose argv "i" "jquery"
```

- 日志文件路径：

```lua
25 verbose logfile logs-max:10 dir:C:\Users\xiuer\AppData\Local\npm-cache\_logs\2024-07-25T07_50_51_104Z-
26 verbose logfile C:\Users\xiuer\AppData\Local\npm-cache\_logs\2024-07-25T07_50_51_104Z-debug-0.log
```

- 依赖树构建：

```csharp
34 timing idealTree:init Completed in 9ms
35 timing idealTree:userRequests Completed in 3ms
36 silly idealTree buildDeps
```

- 获取 jQuery 包信息：

```sql
37 silly fetch manifest jquery@*
38 http fetch GET 200 https://registry.npmjs.org/jquery 63547ms (cache revalidated)
```

获取 jQuery 包的信息花费了 63547 毫秒（约 63.5 秒），可能是由于网络延迟。

- 依赖树构建完成：

```python
40 timing idealTree:#root Completed in 63554ms
...
44 timing idealTree Completed in 63567ms
```

- 依赖安装和审计：

```python
52 timing reifyNode:node_modules/jquery Completed in 101ms
53 timing reify:unpack Completed in 101ms
...
62 timing auditReport:getReport Completed in 277ms
63 silly audit report {}
```

- 安装完成：

```bash
66 timing reify Completed in 63853ms
67 silly ADD node_modules/jquery
68 timing command:i Completed in 63857ms
```

- 退出状态：

```bash
69 verbose exit 0
70 timing npm Completed in 64169ms
71 info ok
```

## 总结

这些日志文件可以帮助开发者了解 npm 在缓存管理方面的具体情况,排查可能出现的问题。例如,如果下载某个包时出现问题,可以查看 log 文件中相关的下载日志,来定位问题的原因。

需要注意的是,log 文件是 npm 内部使用的文件,一般情况下开发者不需要直接查看或修改它。但如果遇到 npm 缓存管理相关的问题,查看这个日志文件可能会提供有用的信息。

