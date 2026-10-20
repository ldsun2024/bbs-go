# MEMORY

## 协作偏好（长期）

- 本地服务由用户**自己手动启动**，不要代为 `go run` / `pnpm dev`，也不要用后台进程拉起。需要验证时只做只读检查（端口、日志、HTTP 探测）；如自己曾占用过端口，需先释放。
- **不要自己执行任何验证命令**（2026-10-20 用户明确要求，连续两次发火）：`tsc` / `pnpm build` / `lint` / 截图 / 起服务，全部不要自动跑。我的职责只有**改文件**，验证由用户自己做。除非用户当次明确要求「跑一下」，否则禁止调用 execute_command。
- 用户要的是**全局可维护的样式体系**：样式应集中在 CSS（`.ui-*` 类）里，页面只引用类名；不要在几十个 tsx 里逐个调工具类数值。第一次改 tsx 换类名不可避免，但之后调样式必须只动一个 CSS 文件。
- 用户很反感「改一个样式拖很久」和「不断自检式的重复工具调用」。要么一次改完，要么先把方案讲清再动手。

## 项目环境（bbs-go）

- 本地 MySQL：`127.0.0.1:3306`，`root` / `123456`，MySQL 8.0.46；本项目库为 `bbsgo`（另有 `bbgo`/`changying`/`hunft` 与本项目无关）。
- `bbs-go.yaml` 已被 .gitignore 忽略，本地需 `Installed: true` 才会连库启动；`Logger.Filename` 要用相对路径 `logs/bbs-go.log`（example 里的 `/data/logs/...` 在 Windows 会落到盘符根）。
- `t_o_id_c_identity` 的 `uk_oidc_issuer_subject` 已改为前缀索引 `(provider_key, issuer(350), subject(350))`，否则 `AutoMigrate` 在 MySQL 会报 `Error 1071 max key length is 3072 bytes`。
