# Honor-Plugin

Yunzai-Bot V3 王者荣耀插件 —— 战力查询、营地数据、英雄战力管理。

## 功能

### 战力查询（无需绑定）

查询英雄最低上榜战力（区服/城市/省份/国标）。

```
#露娜查战力安卓qq
#镜查战力ios微信
#妲己查战力苹果v
```

### 营地数据（绑定营地ID）

绑定营地ID后可查询个人英雄数据。营地ID在王者营地 App「我的」页面可见。

```
#绑定营地 337299135      绑定营地ID
#我的战力                查看英雄战力列表（需Token）
#营地信息                查看段位、胜率等个人资料
#解绑营地                解除绑定
```

### Token 管理

添加营地Token后可解锁完整英雄战力数据。Token通过抓包王者营地 App 获取。

```
#添加token userId&&token   添加Token到池中
#token池                   查看Token池状态
#删除token <userId>        删除Token（管理员）
```

### 帮助

```
#荣耀帮助    #农帮助    #农药帮助
```

## 安装

在 Yunzai-Bot 根目录执���：

```bash
git clone --depth=1 https://github.com/Micuks/honor-plugin.git ./plugins/honor-plugin/
pnpm install -P
```

## Token 获取方法

1. 安卓手机安装 HttpCanary（黄鸟抓包）
2. 打开王者营地 App，随意浏览
3. 在 HttpCanary 中筛选 `kohcamp.qq.com`
4. 从请求头复制 `userId` 和 `token`
5. 发送 `#添加token userId&&token`

## 技术架构

- **干货助手 API** (`sapi.run`) — 英雄最低上榜战力
- **王者营地 API** (`kohcamp.qq.com`) — 个人英雄数据、战绩、资料
  - SSO 模式绕过 campencrypt 加密
  - Token 池管理，支持多 Token 轮转
  - 共享 Token 查公开数据，用户 Token 查完整战力
- **Puppeteer** 渲染 HTML 模板为图片卡片

## 致谢

- [Miao-Plugin](https://github.com/yoimiya-kokomi/miao-plugin) — 参考渲染架构
- [干货助手](https://www.sapi.run/) — 战力数据 API
- [astrbot_plugin_gloryofkings](https://github.com/sangjie-stack/astrbot_plugin_gloryofkings) — 营地 API 参考
