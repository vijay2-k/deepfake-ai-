const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '../server.ts');
let content = fs.readFileSync(serverPath, 'utf-8');

const target = `// 10. Audit Logs Query Endpoint
app.get('/api/admin/intelligence/audit-logs', requireAdminAuth, (_req: Request, res: Response) => {
  const db = initDb();
  res.json({ auditLogs: db.auditLogs || [] });
});`;

const replacement = `// 10. Audit Logs Query Endpoint
app.get('/api/admin/intelligence/audit-logs', requireAdminAuth, (_req: Request, res: Response) => {
  const db = initDb();
  res.json({ auditLogs: db.auditLogs || [] });
});

// 11. Verified Datasets Registry Endpoint
app.get('/api/admin/intelligence/datasets', requireAdminAuth, (_req: Request, res: Response) => {
  try {
    const registryPath = path.join(__dirname, 'scripts/dataset_pipeline/dataset_registry.json');
    if (fs.existsSync(registryPath)) {
      const data = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
      return res.json(data);
    }
    res.status(404).json({ error: 'Dataset registry not found' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read dataset registry: ' + err.message });
  }
});

// 12. Independent Evaluation Benchmark Report Endpoint
app.get('/api/admin/intelligence/benchmarks', requireAdminAuth, (_req: Request, res: Response) => {
  try {
    const reportPath = path.join(__dirname, 'data/evaluation/benchmark_report.json');
    if (fs.existsSync(reportPath)) {
      const data = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
      return res.json(data);
    }
    res.status(404).json({ error: 'Benchmark report not found' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read benchmark report: ' + err.message });
  }
});`;

const normContent = content.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');
const normReplacement = replacement.replace(/\r\n/g, '\n');

if (normContent.includes(normTarget)) {
  fs.writeFileSync(serverPath, normContent.replace(normTarget, normReplacement), 'utf-8');
  console.log('Successfully patched server.ts with dataset & benchmark endpoints.');
} else {
  console.error('Could not find target in server.ts');
}

