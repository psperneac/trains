import { HttpParams } from '@angular/common/http';
import { keys } from 'lodash';

export const toParams = (obj: any): HttpParams => {
  let params = new HttpParams();

  keys(obj).forEach(key => {
    if (obj[key]) {
      params = params.append(key, obj[key]);
    }
  });

  console.log(obj, params);

  return params;
}
