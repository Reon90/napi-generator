const xml = require("xml-js");
const fs = require("fs");
const {buildArgsString,buildReturnString,buildTypeString,snakeToCamel,buildTypeString2,buildConst,removeT} = require('./renderHelpers');
const {buildAst} = require('./ast');

const nunjucks = require("nunjucks");
const CALLS_TEMPLATE = fs.readFileSync(`./templates/calls.njk`, "utf-8");
const INDEX_TEMPLATE = fs.readFileSync(`./templates/index.njk`, "utf-8");
const INTERFACE_TEMPLATE = fs.readFileSync(`./templates/interface.njk`, "utf-8");
nunjucks.configure({ autoescape: false });

const xmlOpts = {
  ignoreComment: true,
  ignoreInstruction: true
};

const ast = fs.readdirSync('./include/ast').map(input => {
    const xmlInput = fs.readFileSync(`./include/ast/${input}`, "utf-8");
    const obj = new xml.xml2js(xmlInput, xmlOpts);
    return buildAst(obj.elements[0].elements, input.includes('types'));
});

const renderedCalls = nunjucks.renderString(CALLS_TEMPLATE, {
    calls: ast.filter(item => item.calls).flatMap(item => item.calls),
    buildArgsString,
    buildTypeString2,
    buildConst,
    buildReturnString,
    buildTypeString,
    snakeToCamel
});
const renderedIndex = nunjucks.renderString(INDEX_TEMPLATE, {
    calls: ast.filter(item => item.calls).flatMap(item => item.calls),
    snakeToCamel
});
const renderedInterface = nunjucks.renderString(INTERFACE_TEMPLATE, {
    calls: ast.filter(item => item.calls).flatMap(item => item.calls),
    enums: ast.filter(item => item.enums)[0].enums,
    structs: ast.filter(item => item.structs)[0].structs,
    snakeToCamel,
    removeT
});

fs.writeFileSync('./generated/calls.c', renderedCalls);
fs.writeFileSync('./generated/index.c', renderedIndex);
fs.writeFileSync('./generated/interface.js', renderedInterface);
