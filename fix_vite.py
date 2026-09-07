import re

with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "import { createServer as createViteServer } from 'vite';\n",
    ""
)

old_block = """// ----------------------------------------------------
// Vite & Static Asset Handling
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist', 'www');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hidden India backend & web server running at http://0.0.0.0:${PORT}`);"""

new_block = """// ----------------------------------------------------
// Server startup (pure API now — the frontend is deployed separately).
// ----------------------------------------------------
async function startServer() {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hidden India backend API running at http://0.0.0.0:${PORT}`);"""

if old_block not in content:
    print("WARNING: old block not found — no changes made. Send this message to Claude.")
else:
    content = content.replace(old_block, new_block)
    with open('server.ts', 'w') as f:
        f.write(content)
    print("Fixed successfully.")
