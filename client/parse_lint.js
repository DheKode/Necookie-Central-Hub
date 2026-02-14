const fs = require('fs');

try {
    // Try reading as UTF-16LE first (PowerShell default)
    let content = fs.readFileSync('lint_report.json', 'utf16le');
    if (!content.trim().startsWith('[')) {
        // Fallback to UTF-8
        content = fs.readFileSync('lint_report.json', 'utf8');
    }

    const report = JSON.parse(content);

    report.forEach(file => {
        if (file.errorCount > 0) {
            console.log(`FILE: ${file.filePath}`);
            file.messages.forEach(msg => {
                console.log(`  Line ${msg.line}:${msg.column} - ${msg.message} (${msg.ruleId})`);
            });
        }
    });

} catch (err) {
    console.error("Failed to parse:", err);
}
