import { Project, SyntaxKind } from 'ts-morph';
import path from 'path';

const project = new Project();
project.addSourceFilesAtPaths(path.resolve(__dirname, '../genesis/blueprints/entity/*.ts'));

let changedCount = 0;

for (const sourceFile of project.getSourceFiles()) {
   const exportDecl = sourceFile.getExportAssignment(d => d.isExportEquals() === false);
   if (!exportDecl) continue;

   const callExpr = exportDecl.getExpressionIfKind(SyntaxKind.CallExpression);
   if (!callExpr) continue;

   const args = callExpr.getArguments();
   if (args.length === 0) continue;

   const objLiteral = args[0].asKind(SyntaxKind.ObjectLiteralExpression);
   if (!objLiteral) continue;

   const invProp = objLiteral.getProperty('inventory');
   if (!invProp) continue;

   const propAssign = invProp.asKind(SyntaxKind.PropertyAssignment);
   if (!propAssign) continue;

   const arrLiteral = propAssign.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
   if (!arrLiteral) continue;

   let hasChanges = false;
   const seenSlots = new Set<string>();

   for (const element of arrLiteral.getElements()) {
      const itemObj = element.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!itemObj) continue;

      const slotProp = itemObj.getProperty('slot');
      if (!slotProp) continue;

      const slotAssign = slotProp.asKind(SyntaxKind.PropertyAssignment);
      if (!slotAssign) continue;

      const slotValueNode = slotAssign.getInitializerIfKind(SyntaxKind.StringLiteral);
      if (!slotValueNode) continue;

      const slotValue = slotValueNode.getLiteralValue();

      if (seenSlots.has(slotValue)) {
         hasChanges = true;
         console.log(`[${sourceFile.getBaseName()}] Moving duplicate slot '${slotValue}' -> 'backpack'`);
         // Mutate properties
         slotAssign.setInitializer("'backpack'");

         // Un-equip it
         const equipProp = itemObj.getProperty('isEquipped');
         if (equipProp) {
            const equipAssign = equipProp.asKind(SyntaxKind.PropertyAssignment);
            if (equipAssign) {
               equipAssign.setInitializer('false');
            }
         }
      } else {
         seenSlots.add(slotValue);
      }
   }

   if (hasChanges) {
      sourceFile.saveSync();
      changedCount++;
   }
}

console.log(`Done AST Migration. Updated ${changedCount} files.`);
