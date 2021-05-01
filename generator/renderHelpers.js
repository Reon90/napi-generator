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

function getTypescriptType(e) {
  const {type, sub_type}=e;
  let t = type;
    switch (true) {
      case type === 'bool': {
        t= `boolean`;
        break;
      }
      case type === 'int' || type === 'uint32_t' || type === 'uint64_t' || type === 'unsigned int' || type === 'short unsigned int': {
        t= `number`;
        break;
      }
      case type === 'char' || type === 'unsigned char': {
        t= `string`;
        break;
      }
      case type === 'double': {
        t= `bigint`;
        break;
      }
      case type === 'void': {
        t= `void`;
        break;
      }
    };
    if(sub_type === 'ArrayType') {
      t+='[]';
    }

    return t;
  };

module.exports = {
    getTypescriptType,
    buildArgsString,
    buildTypeString2,
    buildConst,
    buildReturnString,
    buildTypeString,
    snakeToCamel
};
