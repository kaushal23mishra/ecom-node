const convertObjectToEnum = (obj: Record<string, any>): any[] => {
  const enumArr: any[] = [];
  Object.values(obj).forEach((val) => enumArr.push(val));
  return enumArr;
};

export = convertObjectToEnum;
