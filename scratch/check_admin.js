const fs = require('fs');
let text = fs.readFileSync('templates/admin.html', 'utf8');

// Replace jinja variable expressions with dummy values
text = text.replace(/\{\{\s*fresh_login\s*\}\}/g, 'false');
text = text.replace(/\{\{\s*request_phase_active\s*\}\}/g, 'false');
text = text.replace(/\{\{\s*drop_withdraw_active\s*\}\}/g, 'false');
text = text.replace(/\{\{\s*[\s\S]*?\s*\}\}/g, '""');

// Replace jinja loops with simple loop
text = text.replace(/\{%\s*for\s+[\s\S]*?in[\s\S]*?%\}/g, 'for(let _item of []){');
text = text.replace(/\{%\s*endfor\s*%\}/g, '}');
text = text.replace(/\{%\s*if[\s\S]*?%\}/g, 'if(true){');
text = text.replace(/\{%\s*else\s*%\}/g, '}else{');
text = text.replace(/\{%\s*endif\s*%\}/g, '}');

const scriptMatches = [...text.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];

scriptMatches.forEach((match, idx) => {
    const code = match[1];
    const scriptPos = text.indexOf(match[0]);
    const fileLine = text.substring(0, scriptPos).split('\n').length;
    
    try {
        new Function(code);
        console.log(`Script ${idx} (Line ${fileLine}): OK`);
    } catch (e) {
        console.error(`Script ${idx} (Line ${fileLine}) SyntaxError: ${e.message}`);
        const codeLines = code.split('\n');
        for (let i = 1; i <= codeLines.length; i++) {
            try {
                new Function(codeLines.slice(0, i).join('\n'));
            } catch (err) {
                console.log(` -> Error around script line ${i} (file line ${fileLine + i}): ${err.message}`);
                console.log(`    Line content: ${codeLines[i - 1]}`);
                break;
            }
        }
    }
});
