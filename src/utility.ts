/**
 * @author Paul Roub
 * @see https://stackoverflow.com/questions/25456013/javascript-deepequal-comparison
 */
export function deepEqual(x: any, y: any): boolean {
    if (x === y) {
      return true;
    }
    else if ((typeof x === "object" && x !== null) && (typeof y === "object" && y !== null)) {
      if (Object.keys(x).length !== Object.keys(y).length)
        return false;
  
      for (let prop in x) {
        if (y.hasOwnProperty(prop))
        {  
          if (! deepEqual(x[prop], y[prop]))
            return false;
        }
        else
          return false;
      }
      
      return true;
    }
    else 
      return false;
}

export function deepSetContains<T>(mySet: Set<T>, target: T): boolean {
    for(let value of mySet){
        if(deepEqual(value, target)){
            return true;
        }
    }

    return false;
}

/**
 * @author Kit Sunde
 * @see https://stackoverflow.com/questions/31930894/javascript-set-data-structure-intersect
 */
export function intersectionOfSets<T>(a: Set<T>, b: Set<T>): Set<T> {
    return new Set([...a].filter(i => deepSetContains<T>(b, i)));
}

export function intersectionOfAll<T>(...sets: Set<T>[]): Set<T> {
    if (sets.length === 0){
        return new Set<T>();
    }

    let runningIntersection = sets[0];

    for (let i = 1; i < sets.length; i++) {
        let nextSet = sets[i];
        runningIntersection = intersectionOfSets<T>(runningIntersection, nextSet);
    }

    return runningIntersection;
}

/**
 * @author rsp
 * @see https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
 * TODO: Get this to type check
 */
export function cartesian<T>(...arrays: T[][]): T[][] {
    return arrays.reduce((a:any, b:any) => 
        a.flatMap((d:any) => b.map((e:any) => [d, e].flat()))) as T[][];
}

export function cartesian2D<T1, T2>(array1: T1[], array2: T2[]): [T1, T2][] {
    let cartesianProduct: [T1, T2][] = [];

    for(let i = 0; i < array1.length; i++){
        for(let j = 0; j < array2.length; j++){
            cartesianProduct.push([array1[i], array2[j]]);
        }
    }

    return cartesianProduct;
}

export function toArray<T>(iterable: Iterable<T>): T[]{
    return [...iterable];
}

export function stringifyIterable<T>(iterable: Iterable<T>): string {
    const asArray = toArray(iterable);

    return JSON.stringify(asArray);
}