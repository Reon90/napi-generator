function buildTypeString(v) {
    return `${v.type}${v.sub_type === "PointerType" || v.sub_type === "ArrayType" ? '*' : ''}`;
}
function buildConst(v) {
    return `${v.const ? 'const' : ''}`;
}
function buildTypeString2(v) {
    return `${v.sub_type === "PointerType" || v.sub_type === "ArrayType" ? '*' : ''}`;
}

function buildReturnString(v) {
    if (v.type === 'void' && v.sub_type !== "PointerType") {
        return 'void* res = NULL;\n';
    }
    return `${v.type}${v.sub_type === "PointerType" || v.sub_type === "ArrayType" ? '*' : ''} res =`;
}

function buildArgsString(v) {
    return `${v.sub_type === "PointerType" || v.type === 'void' ? '' : '&'}`;
}

function snakeToCamel(name) {
    return name.replace(/_([a-z])/g, g => g[1].toUpperCase());
}

function removeT(name) {
    return name.replace(/T$/, '');
}

module.exports = {
    buildArgsString,
    buildTypeString2,
    buildConst,
    buildReturnString,
    buildTypeString,
    snakeToCamel,
    removeT
};
