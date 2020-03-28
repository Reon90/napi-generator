function findR(els, id) {
  let res = els.find(el => el.attributes.id === id);
  while (res.attributes.name === undefined) {
    if (res.name === 'FunctionType') {
      return res;
    }
    res = els.find(el => el.attributes.id === res.attributes.type);
  }
  return res;
}

function findStruct(els, id) {
  if (!id) return;
  let res = els.find(el => el.attributes.id === id);
  while (res && (res.name !== 'Struct' || !res.attributes.members)) {
    res = els.find(el => el.attributes.id === res.attributes.type);
  }
  return res;
}

function findEnum(els, id) {
  if (!id) return;
  let res = els.find(el => el.attributes.id === id);
  while (res && res.name !== 'Enumeration') {
    res = els.find(el => el.attributes.id === res.attributes.type);
  }
  return res;
}

function findConst(els, id) {
  if (!id) return;
  let res = els.find(el => el.attributes.id === id);
  while (res && res.attributes.const === undefined) {
    res = els.find(el => el.attributes.id === res.attributes.type);
  }
  return res;
}

function find(els, id) {
  return els.find(el => el.attributes.id === id);
}

function findReverse(els, id) {
  return els.find(el => el.attributes.type === id);
}

function getVar(els, id) {
  const res = find(els, id);
  return { 
    sub_type: res.name === 'Typedef' ? findR(els, res.attributes.type).attributes.name : res.name, 
    type: res.attributes.name || findR(els, res.attributes.type).attributes.name,
    struct: findStruct(els, res.attributes.type),
    enum: findEnum(els, res.attributes.type),
    const: findConst(els, res.attributes.type),
    length: res.attributes.max && (Number(res.attributes.max) + 1)
  };
}

function buildAst(input, isTypes) {
  if (isTypes) {
    const structs = buildStruct(input);
    const enums = buildEnum(input);
    return {structs, enums};
  } else {
    const calls = buildCalls(input);
    return {calls};
  }
}

function buildEnum(input) {
  const enums = input.filter(el => el.name === 'Enumeration').map(e => {
    const res = {};
    e.elements.forEach(v => {
      res[v.attributes.name] = Number(v.attributes.init)
    })
    return {
       name: e.attributes.name,
       values: res
    };
   });
   const res = {};
   enums.forEach(e => {
    Object.assign(res, e.values)
   });
  return res;
}

function buildStruct(input) {
  const structs = input.filter(el => el.name === 'Struct' && el.attributes.members).map(e => {
    const p = findReverse(input, e.attributes.id);

    if ((p.attributes.name || findReverse(input, p.attributes.id).attributes.name) === '__NSConstantString') debugger

    const o = {
      size: e.attributes.size / 8,
      align: e.attributes.align / 8,
      name: p.attributes.name || findReverse(input, p.attributes.id).attributes.name,
      members: e.attributes.members.split(' ').map(m => {
        const f = find(input, m);
        const type = findEnum(input, f.attributes.type) || find(input, f.attributes.type);

        return {
          offset: f.attributes.offset / 8,
          name: f.attributes.name,
          type: (type.name === 'PointerType' || type.name === 'Enumeration') ? type.name : type.attributes.name,
          size: (type.attributes.size || find(input, type.attributes.type).attributes.size) / 8
        };
      })
    };
    return o;
  });
  return structs;
}

function buildCalls(input) {
  const calls = input.filter(el => el.name === 'Function').map(fn => {
    return {
      name: fn.attributes.name,
      res: getVar(input, fn.attributes.returns),
      args: fn.elements ? fn.elements.map((a, i) => {
        //if (fn.attributes.name === 'sk_typeface_create_from_name_with_font_style') debugger
        const o = {i, ...getVar(input, a.attributes.original_type || a.attributes.type)};
        if (a.attributes.name) {
          o.name = a.attributes.name;
        }
        if (o.type === 'float') {
          o.type = 'double';
        }

        return o;
      }) : []
    };
  });

  return calls;
}

module.exports = {
  buildAst
}
