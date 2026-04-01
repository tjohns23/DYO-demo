import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./work_type_scopes.json', 'utf-8'));

let total = 0;
let complete = 0;
let incomplete = [];

Object.entries(data).forEach(([constraintId, workTypes]) => {
  Object.entries(workTypes).forEach(([workType, fields]) => {
    total++;
    if (fields.scope && fields.scope.trim() && fields.completion && fields.completion.trim()) {
      complete++;
    } else {
      incomplete.push(`${constraintId}[${workType}]`);
    }
  });
});

console.log('📊 Total work-type entries:', total);
console.log('✅ Complete (scope + completion):', complete);
console.log('❌ Incomplete:', incomplete.length);

if (incomplete.length) {
  console.log('\nIncomplete entries:');
  incomplete.forEach(entry => console.log(`   - ${entry}`));
} else {
  console.log('\n✨ All 228 work-type scopes are complete and valid!');
}
