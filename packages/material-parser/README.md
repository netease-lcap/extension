# Lcap Material Parser

CodeWave 物料解析方案

```typescript
import fs from 'fs';
import { parse as parseMaterial } from '@lcap/material-parser';
const result = await parseMaterial({
  name: 'antd',
  version: 'latest', // 默认拉最新的
  tempDir: './node_modules/.temp', // 临时目录， 默认 './node_modules/.temp'
  npmClient: 'npm', // 默认 npm
});
```
