function ofType(val,type){
  const tDefined = arguments.length>=2;
  const tString = typeof type==='string';
  const tFun = typeof type==='function';
  const tUnd = typeof type==='undefined';
  const vUnd = typeof val==='undefined';
  const tNull = type===null;
  const vNull = val===null;
  const tArr = !tNull && typeof type==='object' && type.constructor.name === 'Array';
  const tReg = type&&type.constructor.name === 'RegExp';
  const reg = /^\[object Arguments\]$/i;

  if(!tDefined) return false;
  if(tNull) return vNull;
  if(tUnd) return val===undefined;
  if(tFun){
    if(vUnd||vNull) return false;
    return val.constructor.name === type.name;
  }

  if(tArr){
    if(!type.length) return true;
    for(var i in type){
      if(type[i]===null&&vNull) return true;
      if(typeof type[i]==='undefined'&&vUnd) return true;
      if(vNull||vUnd) continue;
      if(type[i]===null||typeof type[i]==='undefined') continue;
      if(val.constructor.name === type[i].name) return true;
    }
    return false;
  }

  if(tString){
    var t = type.toLowerCase().split('|');
    if((t.length===1&&t[0]==='')||(t.some((i)=>i==='any'))) return true;
    if(t.some((i)=>i==='truthy')&&!!val) return true;
    if(t.some((i)=>i==='falsy')&&!val) return true;
    if(vUnd&&t.some((i)=>i==='undefined')) return true;
    if(vNull&&t.some((i)=>i==='null')) return true;
    if(vNull||val===undefined) return false;
    if((reg).test(val.toString())&&val.constructor.name==='Object'&&t.some((i)=>i==='arguments')) return true;
    return t.some((i)=>i===val.constructor.name.toLowerCase());
  }

  if(tReg){
    if(type.test('any')||type.test('')) return true;
    if(type.test('truthy')&&!!val) return true;
    if(type.test('falsy')&&!val) return true;
    if(type.test('undefined')&&vUnd) return true;
    if(type.test('null')&&vNull) return true;
    if(vNull||val===undefined) return false;
    if(type.test('arguments')&&val.constructor.name==='Object'&&(reg).test(val.toString())) return true;
    return type.test(val.constructor.name);
  }
  return false;
}

if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports) {
  module.exports = ofType;
}