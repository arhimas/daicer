import { Project } from 'ts-morph';
import * as path from 'path';

const project = new Project({
  tsConfigFilePath: path.resolve(__dirname, '../../tsconfig.json'),
});

const paths = project.getCompilerOptions().paths || {};


// Sort paths by length (descending) to match most specific alias first
const sortedAliases = Object.keys(paths)
  .filter((alias) => alias !== '@strapi/client')
  .sort((a, b) => b.length - a.length);

console.log('Loaded path aliases:', sortedAliases);

let changeCount = 0;

for (const sourceFile of project.getSourceFiles()) {
  const filePath = sourceFile.getFilePath();
  
  if (filePath.includes('node_modules') || filePath.includes('dist') || filePath.includes('.cache')) {
      continue;
  }

  const imports = sourceFile.getImportDeclarations();

  for (const importDecl of imports) {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();

    if (moduleSpecifier.startsWith('.')) {
      const sourceFileDir = path.dirname(filePath);
      const absoluteModulePath = path.resolve(sourceFileDir, moduleSpecifier);
      
      const projectRoot = path.resolve(process.cwd());
      let relativeToRoot = path.relative(projectRoot, absoluteModulePath);
      
      relativeToRoot = relativeToRoot.split(path.sep).join('/');

      let matchedAlias = null;
      
      for (const alias of sortedAliases) {
          const targetPaths = paths[alias];
          if (!targetPaths || targetPaths.length === 0) continue;
          
          const aliasPrefix = alias.replace(/\*$/, '');
          const targetPrefix = targetPaths[0].replace(/\*$/, '');

          if (relativeToRoot.startsWith(targetPrefix)) {
              const remainder = relativeToRoot.substring(targetPrefix.length);
              
              if (alias.endsWith('*')) {
                  matchedAlias = aliasPrefix + remainder;
              } else if (relativeToRoot === targetPaths[0] || relativeToRoot === targetPaths[0].replace(/\.ts$/, '')) {
                  matchedAlias = alias;
              }
              
              if (matchedAlias) {
                  matchedAlias = matchedAlias.replace(/\.ts$/, '').replace(/\.tsx$/, '').replace(/\/index$/, '');
                  break; 
              }
          }
      }

      if (matchedAlias && matchedAlias !== moduleSpecifier) {
          console.log(`[${sourceFile.getBaseName()}] Replacing '${moduleSpecifier}' -> '${matchedAlias}'`);
          importDecl.setModuleSpecifier(matchedAlias);
          changeCount++;
      }
    }
  }
}

if (changeCount > 0) {
    console.log(`Saving ${changeCount} changes...`);
    project.saveSync();
}
