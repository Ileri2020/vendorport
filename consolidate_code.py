import os
from datetime import datetime

def consolidate_code(root_dir, output_file):
    # Directories to skip
    skip_dirs = {
        'node_modules', 'venv', 'env', '.venv', '__pycache__', 
        '.git', '.next', 'dist', 'build', '.vercel', 'public', 'assets',
        'migrations', 'staticfiles', 'forex_data', 'trading_data', '.vscode',
        'out', '.turbo', 'coverage', '.cache'
    }
    
    # Files to skip
    skip_files = {
        'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 
        '.DS_Store', 'consolidate_code.py',
        '.gitignore', '.env', '.env.local', 'tsconfig.json', 'package.json',
        'postcss.config.js', 'tailwind.config.js', 'components.json',
        'eslint.config.js', 'vite.config.ts', 'tsconfig.app.json',
        'tsconfig.node.json', 'full_project_code.txt', 'next.config.js',
        'next.config.mjs', 'next-env.d.ts', '.eslintrc.json'
    }
    
    # Extensions to include
    include_extensions = {
        '.py', '.js', '.ts', '.tsx', '.jsx', '.html', '.css', '.prisma'
    }

    file_count = 0
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        # Write compact header
        outfile.write("=" * 80 + "\n")
        outfile.write("SUCCO PROJECT - SOURCE CODE CONSOLIDATION\n")
        outfile.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        outfile.write("=" * 80 + "\n\n")
        
        for root, dirs, files in os.walk(root_dir):
            # Prune directories in-place to avoid walking into skipped dirs
            dirs[:] = [d for d in dirs if d not in skip_dirs]
            
            for file in files:
                if file in skip_files:
                    continue
                
                ext = os.path.splitext(file)[1].lower()
                if ext not in include_extensions:
                    continue
                
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, root_dir)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as infile:
                        content = infile.read()
                    
                    # Skip very large files
                    if len(content) > 1000000:  # 1MB limit
                        print(f"Skipped (too large): {relative_path}")
                        continue
                        
                    outfile.write("\n" + "=" * 80 + "\n")
                    outfile.write(f"LOCATION: {relative_path}\n")
                    outfile.write("=" * 80 + "\n\n")
                    outfile.write(content)
                    outfile.write("\n\n")
                    print(f"Added: {relative_path}")
                    file_count += 1
                except Exception as e:
                    print(f"Could not read {relative_path}: {e}")
        
        # Write footer
        outfile.write("\n" + "=" * 80 + "\n")
        outfile.write(f"TOTAL FILES CONSOLIDATED: {file_count}\n")
        outfile.write("=" * 80 + "\n")

if __name__ == "__main__":
    project_root = os.path.dirname(os.path.abspath(__file__))
    output_filename = "full_project_code.txt"
    print(f"Starting consolidation in {project_root}...")
    consolidate_code(project_root, output_filename)
    print(f"\nDone! All source code consolidated into {output_filename}")
    print(f"Output file size: {os.path.getsize(output_filename) / 1024:.2f} KB")
