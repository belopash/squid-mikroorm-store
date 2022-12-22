"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_internal_1 = require("@subsquid/util-internal");
const commander_1 = require("commander");
(0, util_internal_1.runProgram)(async () => {
    commander_1.program.description('Create template file for a new migration');
    commander_1.program.option('--name', 'name suffix for new migration', 'Data');
    // let {name} = program.parse().opts() as {name: string}
    // let dir = new OutDir(MIGRATIONS_DIR)
    // let timestamp = Date.now()
    // let out = dir.file(`${timestamp}-${name}.js`)
    // out.block(`module.exports = class ${name}${timestamp}`, () => {
    //     out.line(`name = '${name}${timestamp}'`)
    //     out.line()
    //     out.block(`async up(db)`, () => {
    //         out.line()
    //     })
    //     out.line()
    //     out.block(`async down(db)`, () => {
    //         out.line()
    //     })
    // })
    // out.write()
});
//# sourceMappingURL=create.js.map