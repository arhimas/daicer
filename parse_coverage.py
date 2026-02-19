
import re

def parse_coverage(file_path):
    with open(file_path, 'r') as f:
        lines = f.readlines()
    
    low_coverage_files = []
    
    # Regex to match lines in the table: File | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
    # Example: src/api/game/services/game.ts | 80 | 75 | 80 | 80 | ...
    # Note: the lines usually start with file path or name.
    
    for line in lines:
        if '|' not in line or 'All files' in line or '% Stmts' in line or '---' in line:
            continue
            
        parts = [p.strip() for p in line.split('|')]
        if len(parts) >= 5:
            file_name = parts[0]
            try:
                branch_cov = float(parts[2])
                if branch_cov < 85:
                    low_coverage_files.append((file_name, branch_cov))
            except ValueError:
                continue
                
    low_coverage_files.sort(key=lambda x: x[1])
    
    print("Files with < 85% Branch Coverage:")
    for f, cov in low_coverage_files:
        print(f"{f}: {cov}%")

parse_coverage('coverage_report_v3.txt')
