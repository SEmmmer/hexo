import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

function run(command, args, { capture = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    shell: false,
    windowsHide: true,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(capture && result.stderr.trim()
      ? result.stderr.trim()
      : `${command} 执行失败（退出码 ${result.status}）。`);
  }
  return result.stdout?.trim() ?? '';
}

try {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log('用法：npm run sync -- "更新说明"\n先生成博客，再提交本仓库的全部未忽略改动，最后推送 origin/main。');
    process.exit(0);
  }

  const branch = run('git', ['branch', '--show-current'], { capture: true });
  if (branch !== 'main') {
    throw new Error(`当前分支是 ${branch || '游离状态'}；请先切换到 main 再同步。`);
  }
  run('git', ['remote', 'get-url', 'origin'], { capture: true });
  if (run('git', ['diff', '--name-only', '--diff-filter=U'], { capture: true })) {
    throw new Error('存在尚未解决的 Git 冲突，请解决后再同步。');
  }

  console.log('\n[1/3] 检查并生成博客……');
  const hexoBin = require.resolve('hexo/bin/hexo');
  run(process.execPath, [hexoBin, 'clean']);
  run(process.execPath, [hexoBin, 'generate']);

  console.log('\n[2/3] 保存改动……');
  run('git', ['add', '--all']);
  const changes = run('git', ['diff', '--cached', '--name-only'], { capture: true });
  if (changes) {
    const timestamp = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Shanghai',
      dateStyle: 'short',
      timeStyle: 'medium',
    }).format(new Date());
    const message = args.join(' ').trim() || `更新博客：${timestamp}`;
    run('git', ['commit', '-m', message]);
  } else {
    console.log('没有新改动；继续检查是否有尚未推送的提交。');
  }

  console.log('\n[3/3] 推送到 GitHub……');
  run('git', ['push', '--set-upstream', 'origin', 'main']);
  console.log('\n源码已推送。GitHub Actions 将自动发布网站。');
  console.log('发布进度：https://github.com/SEmmmer/hexo/actions');
  console.log('博客地址：https://semmmer.github.io/hexo/');
} catch (error) {
  console.error(`\n同步未完成：${error.message}`);
  console.error('请修复上述错误后重新运行 npm run sync；已有的本地提交会保留。');
  process.exitCode = 1;
}
