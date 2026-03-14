const huCatalog = require("./huCatalog.cjs");

function normalizeHuId(id) {
  if (id === "USD0") return "USD01";
  return id;
}

function extractIds(testFullName) {
  const matches = testFullName.match(/\b(USD\d+|UCD\d+|ADM\d+)\b/g);
  if (!matches) return [];

  const normalized = matches.map(normalizeHuId);
  return Array.from(new Set(normalized));
}

class HuReporter {
  onRunComplete(_contexts, results) {
    const passedByHu = new Map();
    const failedByHu = new Map();

    for (const testSuite of results.testResults ?? []) {
      for (const assertion of testSuite.testResults ?? []) {
        const ids = extractIds(assertion.fullName || "");
        if (ids.length === 0) continue;

        for (const id of ids) {
          const name = huCatalog[id] || "(sin nombre en huCatalog)";
          const key = `${id} - ${name}`;

          if (assertion.status === "passed") {
            passedByHu.set(key, (passedByHu.get(key) || 0) + 1);
          } else if (assertion.status === "failed") {
            failedByHu.set(key, (failedByHu.get(key) || 0) + 1);
          }
        }
      }
    }

    const passedOnly = Array.from(passedByHu.keys()).filter(
      (k) => !failedByHu.has(k)
    );
    const failed = Array.from(failedByHu.keys());

    passedOnly.sort();
    failed.sort();

    // Salida compacta y fácil de distinguir en terminal.
    // Si una HU tiene al menos un test fallido, se reporta como FAIL.
    if (passedOnly.length > 0) {
      // eslint-disable-next-line no-console
      console.log("\nHU PASS (ID - Nombre):");
      for (const k of passedOnly) {
        // eslint-disable-next-line no-console
        console.log(`  OK  ${k}`);
      }
    }

    if (failed.length > 0) {
      // eslint-disable-next-line no-console
      console.log("\nHU FAIL (ID - Nombre):");
      for (const k of failed) {
        // eslint-disable-next-line no-console
        console.log(`  FAIL ${k}`);
      }
    }
  }
}

module.exports = HuReporter;
