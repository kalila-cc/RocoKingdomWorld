# 珍稀孵蛋规划台

离线优先的《洛克王国：世界》异色、炫彩与异色炫彩登记及小窝摆放推荐工具。

## 架构

- `app/page.tsx`：页面编排入口，只负责组合模块和派生统计。
- `app/components/`：图鉴、摆窝、扩散路线与站点区块组件。
- `app/hooks/use-planner-progress.ts`：拥有记录、筛选偏好与本地持久化边界。
- `app/planner-core.ts`：唯一的推荐领域引擎，负责亲本筛选、形态遗传、限时优先级、窝位布局、配对连线与扩散路线。
- `app/data.ts`：由数据库更新器生成的类型化精灵数据。
- `styles/site/`：按基础、摆窝、路线、图鉴、规则、响应式拆分的样式源码。
- `app/globals.css` 与 `offline/assets/style.css`：由样式分片自动合成的同源产物，请勿手工编辑。
- `offline/assets/app.js`：离线页面展示层，不再包含推荐算法。
- `offline/assets/planner-core.js`：由 `app/planner-core.ts` 自动生成的浏览器脚本，请勿手工编辑。
- `scripts/updater/`：按运行时、Wiki 来源、蛋组来源、数据库构建、安装事务拆分的更新器源码。
- `scripts/update-pet-database.ps1` 与 `offline/tools/update-pet-database.ps1`：由更新器模块合成的带 BOM 单文件工具。
- `scripts/build-offline-assets.mjs`：统一生成规划引擎、CSS 和单文件更新器。
- `scripts/package-offline.ps1`：生成不含数据库备份目录的可分发文件夹与 ZIP。

数据流：

```text
BWiki / 公开蛋组接口
        ↓
update-pet-database.ps1
        ↓
app/data.ts + offline/assets/data.js + 本地头像
        ↓
planner-core.ts ──自动生成──> offline/assets/planner-core.js
        ↓                              ↓
React 页面                    双击可运行的离线页面
```

## 常用命令

```bash
npm install
npm run dev
npm run lint
npm test
npm run package:offline
```

- `npm run build` 会先生成离线共享逻辑，再构建站点。
- `npm test` 会验证服务端渲染、离线资源完整性、限时/常驻优先级、地区形态和珍稀形态共存逻辑。
- `npm run package:offline` 会将 `offline/` 同步到 `outputs/洛克异色孵蛋规划台/` 并生成 ZIP，自动排除 `offline/backup/`。

## 维护约束

- 推荐规则只修改 `app/planner-core.ts`，不要在离线 UI 中复制算法。
- 页面模块修改 `app/components/`，持久化格式与迁移集中修改 `app/hooks/use-planner-progress.ts`。
- 样式只修改 `styles/site/` 分片，构建会同步生成在线与离线 CSS。
- 更新器只修改 `scripts/updater/` 模块，构建会生成项目内与离线包内的单文件副本。
- 精灵数据库和头像通过更新器生成，不手工编辑生成文件。
- 数据中的 `flags` 只描述亲本繁育资格；`offspringKey` 单独描述该形态作为母本时对应的后代卡片，避免把后天形态误当成可孵目标。
- 用户拥有记录保存在浏览器本地存储，导入导出格式需保持向后兼容。
