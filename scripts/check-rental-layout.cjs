// Guard the existing rental layouts and CTA wiring against unrelated changes.
const fs = require('node:fs');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const ts = require('../frontend/node_modules/typescript');
const names = ['RentalsIntro', 'HotShotRentals', 'WhyRentWithUs', 'RentalHowItWorks', 'RentalFaq', 'RentalFinalCta', 'RentalDetailContent', 'RentalCard'];
const capture = process.argv.includes('--capture');
const baseline = capture ? {} : require('./rental-layout-baseline.json');
for (const name of names) {
  const path = `frontend/src/components/rentals/${name}.tsx`;
  const source = capture ? cp.execFileSync('git', ['show', `26f90f6:${path}`], {encoding:'utf8'}) : fs.readFileSync(path,'utf8');
  const ast = ts.createSourceFile(name, source, 99, true, 4);
  const styles = [], buttons = [], ctas = [];
  function visit(n) {
    if (ts.isJsxAttribute(n) && n.name.text === 'sx') styles.push(n.getText(ast).replace(/\s+/g, ''));
    if ((ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) && ['Button','IconButton'].includes(n.tagName.getText(ast))) buttons.push(n.getText(ast).replace(/\s+/g,''));
    if (ts.isCallExpression(n) && n.expression.getText(ast) === 'useCta') ctas.push(n.getText(ast).replace(/\s+/g,''));
    ts.forEachChild(n,visit);
  }
  visit(ast);
  const digest = values => crypto.createHash('sha256').update(JSON.stringify(values)).digest('hex');
  const actual = {styles:digest(styles), buttons:digest(buttons), ctas:digest(ctas)};
  if(capture) baseline[name] = actual;
  else assert.deepEqual(actual,baseline[name], `${name}: styles/buttons/CTA wiring changed`);
}
if(capture) console.log(JSON.stringify(baseline,null,2));
else console.log('PASS: existing rental styling, button props and CTA wiring match the pre-change baseline');
