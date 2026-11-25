# Changesets

改动组件库时，在提交里附带一个变更说明：

```sh
pnpm changeset
```

选择受影响的包和版本级别（`0.x` 期间不兼容变更升 minor，其余升 patch），写一句面向使用者的说明。发布时由 `changeset version` 汇总进 `packages/ui/CHANGELOG.md` 并更新版本号。
