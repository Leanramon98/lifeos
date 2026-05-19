console.log("Start");

console.log("1. requiring fs...");
require("fs");
console.log("1 done.");

console.log("2. requiring get-project-dir...");
require("./node_modules/next/dist/lib/get-project-dir");
console.log("2 done.");

console.log("3. requiring utils...");
require("./node_modules/next/dist/server/lib/utils");
console.log("3 done.");

console.log("4. requiring config...");
require("./node_modules/next/dist/server/config");
console.log("4 done.");

console.log("5. requiring constants...");
require("./node_modules/next/dist/shared/lib/constants");
console.log("5 done.");

console.log("6. requiring has-necessary-dependencies...");
require("./node_modules/next/dist/lib/has-necessary-dependencies");
console.log("6 done.");

console.log("7. requiring install-dependencies...");
require("./node_modules/next/dist/lib/install-dependencies");
console.log("7 done.");

console.log("8. requiring find-up...");
require("./node_modules/next/dist/compiled/find-up");
console.log("8 done.");

console.log("9. requiring find-pages-dir...");
require("./node_modules/next/dist/lib/find-pages-dir");
console.log("9 done.");

console.log("10. requiring verify-typescript-setup...");
require("./node_modules/next/dist/lib/verify-typescript-setup");
console.log("10 done.");

console.log("11. requiring path...");
require("path");
console.log("11 done.");

console.log("12. requiring cross-spawn...");
require("./node_modules/next/dist/compiled/cross-spawn");
console.log("12 done.");

console.log("All required successfully!");
