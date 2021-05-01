function findR(els, id) {
  let res = els.find(el => el.attributes.id === id);
  while (res && res.attributes.name === undefined) {
    if (res.name === 'FunctionType') {
      return { attributes: { name:'FunctionType' }, args: res.elements ? res.elements.map(arg => getVar(els, arg.attributes.type)) : [] };
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
  const el = findR(els, res.attributes.type);
  const o = {
    sub_type: res.name === 'Typedef' ? el.attributes.name : res.name, 
    type: res.attributes.name || el.attributes.name,
    struct: findStruct(els, res.attributes.type),
    enum: findEnum(els, res.attributes.type),
    const: findConst(els, res.attributes.type),
    length: res.attributes.max && (Number(res.attributes.max) + 1),
    args: el && el.args
  };
  if (o.type === 'float') {
    o.type = 'double';
  }
  return o;
}

function buildAst(input, isTypes) {
    const structs = buildStruct(input);
    const fn = buildFn(input);
    const enums = buildEnum(input);
    const calls = buildCalls(input);
    return {structs, enums, calls, fn};
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
  const structs = input.filter(el => el.name === 'Struct').map(e => {
    const p = findReverse(input, e.attributes.id);

    //if ((p.attributes.name || findReverse(input, p.attributes.id).attributes.name) === 'sk_imageinfo_t') debugger

    const o = {
      size: e.attributes.size,
      align: e.attributes.align,
      name: p.attributes.name || findReverse(input, p.attributes.id).attributes.name
    };

    if (e.attributes.members) {
      o.members = e.attributes.members.split(' ').map(m => {
        const f = find(input, m);
        let type = findEnum(input, f.attributes.type) || find(input, f.attributes.type);
        const sub_type = type.name;
        if (type.name === 'ArrayType' || type.name === 'PointerType') {
          type = find(input, type.attributes.type);
        }

        return {
          sub_type,
          name: f.attributes.name,
          type: type.attributes.name === 'float' ? 'double' : type.attributes.name,
        };
      })
    }
    return o;
  });
  return structs;
}

function buildFn(input) {
  const fn = input.filter(el => el.name === 'Typedef')
    .filter(el => find(input, el.attributes.type).name === 'PointerType')
    .filter(el => {
      const r = find(input, el.attributes.type);
      return find(input, r.attributes.type).name === 'FunctionType'
    })
    .map(t => {
    const a = find(input, t.attributes.type);
    const e = find(input, a.attributes.type);

    const o = {
      name: t.attributes.name,
      res: getVar(input, e.attributes.returns),
      args: e.elements ? e.elements.map((a, i) => {
        const o = {i, ...getVar(input, a.attributes.original_type || a.attributes.type)};
        if (a.attributes.name) {
          o.name = a.attributes.name;
        }

        return o;
      }) : []
    };
    return o;
  });
  return fn;
}

function buildCalls(input) {
  const calls = input.filter(el => el.name === 'Function').map(fn => {
    if (fn.attributes.name === 'glfwGetWindowOpacity') debugger
    return {
      name: fn.attributes.name,
      res: getVar(input, fn.attributes.returns),
      args: fn.elements ? fn.elements.map((a, i) => {
        
        const o = {i, ...getVar(input, a.attributes.original_type || a.attributes.type)};
        if (a.attributes.name) {
          o.name = a.attributes.name;
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
